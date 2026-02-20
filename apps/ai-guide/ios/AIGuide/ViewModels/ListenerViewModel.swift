import Foundation
import Network

/// ViewModel for the Listener role — connects to a guide session
/// and displays translated text.
@Observable
final class ListenerViewModel {
    // MARK: - Services

    let ttsService = TTSService()
    let multipeerService = MultipeerService()

    // MARK: - State

    var isConnected: Bool = false
    var selectedLanguage: SupportedLanguage = .english
    var guideName: String = ""
    var sourceLanguage: SupportedLanguage = .german
    var availableLanguages: [SupportedLanguage] = []
    var currentTranslation: String = ""
    var translationHistory: [TranslationChunk] = []
    var fontSize: CGFloat = 24
    var connectionMethod: ConnectionMethod = .none

    // MARK: - Private

    private var webSocketConnection: NWConnection?
    private let queue = DispatchQueue(label: "com.fintutto.aiguide.listener")

    // MARK: - Connection

    /// Connect to a guide session via WebSocket using a session code.
    func connect(host: String, port: UInt16) async throws {
        let parameters = NWParameters.tcp
        let wsOptions = NWProtocolWebSocket.Options()
        parameters.defaultProtocolStack.applicationProtocols.insert(wsOptions, at: 0)

        let connection = NWConnection(
            host: NWEndpoint.Host(host),
            port: NWEndpoint.Port(rawValue: port)!,
            using: parameters
        )

        connection.stateUpdateHandler = { [weak self] state in
            Task { @MainActor in
                switch state {
                case .ready:
                    self?.isConnected = true
                    self?.connectionMethod = .websocket
                    self?.sendLanguageRequest()
                case .failed, .cancelled:
                    self?.isConnected = false
                default:
                    break
                }
            }
        }

        webSocketConnection = connection
        connection.start(queue: queue)

        receiveMessages()
    }

    /// Connect via Multipeer Connectivity (auto-discovery).
    func connectViaMultipeer() {
        multipeerService.startBrowsing()

        multipeerService.onDataReceived = { [weak self] data, _ in
            self?.handleReceivedData(data)
        }

        multipeerService.onGuideDiscovered = { [weak self] peer, info in
            Task { @MainActor in
                self?.guideName = info?["guideName"] ?? peer.displayName
            }
            // Auto-connect to the first discovered guide
            self?.multipeerService.connectToGuide(peer)
            Task { @MainActor in
                self?.isConnected = true
                self?.connectionMethod = .multipeer
            }
        }
    }

    /// Disconnect from the current session.
    func disconnect() {
        webSocketConnection?.cancel()
        webSocketConnection = nil
        multipeerService.disconnect()
        isConnected = false
        connectionMethod = .none
        currentTranslation = ""
        translationHistory.removeAll()
    }

    // MARK: - Language Selection

    func selectLanguage(_ language: SupportedLanguage) {
        selectedLanguage = language
        if isConnected {
            sendLanguageRequest()
        }
    }

    // MARK: - Display Settings

    func increaseFontSize() {
        fontSize = min(fontSize + 2, 48)
    }

    func decreaseFontSize() {
        fontSize = max(fontSize - 2, 14)
    }

    // MARK: - Private

    private func receiveMessages() {
        guard let connection = webSocketConnection else { return }

        connection.receiveMessage { [weak self] content, context, isComplete, error in
            guard let self else { return }

            if let data = content {
                self.handleReceivedData(data)
            }

            if error == nil {
                self.receiveMessages()
            }
        }
    }

    private func handleReceivedData(_ data: Data) {
        guard let message = try? JSONDecoder().decode(WSMessage.self, from: data) else { return }

        switch message.type {
        case .translation:
            if let chunk = try? JSONDecoder().decode(TranslationChunk.self, from: message.payload) {
                guard chunk.targetLanguage == selectedLanguage.rawValue else { return }
                Task { @MainActor in
                    self.currentTranslation = chunk.translatedText
                    self.translationHistory.append(chunk)

                    // TTS output if enabled
                    self.ttsService.speak(chunk.translatedText, language: self.selectedLanguage)
                }
            }

        case .sessionInfo:
            if let session = try? JSONDecoder().decode(GuideSession.self, from: message.payload) {
                Task { @MainActor in
                    self.guideName = session.guideName
                    self.sourceLanguage = session.sourceLanguage
                    self.availableLanguages = session.availableLanguages
                }
            }

        case .status:
            break // Handle pause/resume status updates

        case .languageRequest:
            break // Only handled by server
        }
    }

    private func sendLanguageRequest() {
        let request: [String: String] = [
            "targetLanguage": selectedLanguage.rawValue,
            "deviceName": UIDevice.current.name
        ]

        guard let payload = try? JSONEncoder().encode(request) else { return }
        let message = WSMessage(type: .languageRequest, payload: payload)
        guard let data = try? JSONEncoder().encode(message) else { return }

        switch connectionMethod {
        case .websocket:
            let metadata = NWProtocolWebSocket.Metadata(opcode: .text)
            let context = NWConnection.ContentContext(
                identifier: "websocket",
                metadata: [metadata]
            )
            webSocketConnection?.send(
                content: data,
                contentContext: context,
                isComplete: true,
                completion: .contentProcessed { _ in }
            )
        case .multipeer:
            multipeerService.sendToAll(data)
        case .none:
            break
        }
    }
}

// MARK: - Connection Method

enum ConnectionMethod {
    case none
    case websocket
    case multipeer
}
