import Foundation
import Network

/// Local WebSocket server running on the guide's device.
/// Broadcasts translated text to all connected listeners (iOS + Android).
@Observable
final class SessionServer {
    // MARK: - State

    var isRunning: Bool = false
    var connectedListeners: [ConnectedListener] = []
    var sessionCode: String = ""
    var port: UInt16 = 0

    // MARK: - Private

    private var listener: NWListener?
    private var connections: [String: NWConnection] = [:]
    private let queue = DispatchQueue(label: "com.fintutto.aiguide.server")

    /// Callback when a listener requests a language
    var onLanguageRequested: ((SupportedLanguage) -> Void)?

    // MARK: - Public API

    /// Start the WebSocket server on a random available port.
    func start() throws {
        let parameters = NWParameters.tcp
        let wsOptions = NWProtocolWebSocket.Options()
        parameters.defaultProtocolStack.applicationProtocols.insert(wsOptions, at: 0)

        listener = try NWListener(using: parameters, on: .any)
        sessionCode = GuideSession.generateCode()

        listener?.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                if let port = self?.listener?.port?.rawValue {
                    Task { @MainActor in
                        self?.port = port
                        self?.isRunning = true
                    }
                }
            case .failed(let error):
                print("Server failed: \(error)")
                Task { @MainActor in
                    self?.isRunning = false
                }
            default:
                break
            }
        }

        listener?.newConnectionHandler = { [weak self] connection in
            self?.handleNewConnection(connection)
        }

        listener?.start(queue: queue)
    }

    /// Stop the server and disconnect all listeners.
    func stop() {
        for (_, connection) in connections {
            connection.cancel()
        }
        connections.removeAll()
        listener?.cancel()
        listener = nil
        isRunning = false
        connectedListeners.removeAll()
    }

    /// Broadcast a translation chunk to all listeners requesting that language.
    func broadcast(_ chunk: TranslationChunk) {
        guard let data = try? WSMessage.translation(chunk) else { return }

        let targetLanguage = chunk.targetLanguage
        for listener in connectedListeners where listener.targetLanguage.rawValue == targetLanguage {
            guard let connection = connections[listener.id] else { continue }
            sendWebSocketMessage(data, on: connection)
        }
    }

    /// Broadcast a translation chunk to ALL listeners regardless of language
    /// (used when sending source text for local fallback translation).
    func broadcastToAll(_ data: Data) {
        for (_, connection) in connections {
            sendWebSocketMessage(data, on: connection)
        }
    }

    /// Send session info to a specific listener.
    func sendSessionInfo(to listenerID: String, session: GuideSession) {
        guard let connection = connections[listenerID],
              let data = try? WSMessage.sessionInfo(session) else { return }
        sendWebSocketMessage(data, on: connection)
    }

    // MARK: - Private

    private func handleNewConnection(_ connection: NWConnection) {
        let connectionID = UUID().uuidString

        connection.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                self?.receiveMessages(from: connection, id: connectionID)
            case .failed, .cancelled:
                Task { @MainActor in
                    self?.connections.removeValue(forKey: connectionID)
                    self?.connectedListeners.removeAll { $0.id == connectionID }
                }
            default:
                break
            }
        }

        connections[connectionID] = connection
        connection.start(queue: queue)
    }

    private func receiveMessages(from connection: NWConnection, id: String) {
        connection.receiveMessage { [weak self] content, context, isComplete, error in
            guard let self else { return }

            if let data = content, !data.isEmpty {
                self.handleIncomingMessage(data, from: id)
            }

            if error == nil {
                self.receiveMessages(from: connection, id: id)
            }
        }
    }

    private func handleIncomingMessage(_ data: Data, from connectionID: String) {
        guard let message = try? JSONDecoder().decode(WSMessage.self, from: data) else { return }

        switch message.type {
        case .languageRequest:
            if let request = try? JSONDecoder().decode(LanguageRequestPayload.self, from: message.payload) {
                let language = SupportedLanguage(rawValue: request.targetLanguage) ?? .english
                let listener = ConnectedListener(
                    id: connectionID,
                    deviceName: request.deviceName,
                    targetLanguage: language,
                    connectedAt: Date()
                )
                Task { @MainActor in
                    // Update or add listener
                    if let index = self.connectedListeners.firstIndex(where: { $0.id == connectionID }) {
                        self.connectedListeners[index] = listener
                    } else {
                        self.connectedListeners.append(listener)
                    }
                    self.onLanguageRequested?(language)
                }
            }
        default:
            break
        }
    }

    private func sendWebSocketMessage(_ data: Data, on connection: NWConnection) {
        let metadata = NWProtocolWebSocket.Metadata(opcode: .text)
        let context = NWConnection.ContentContext(
            identifier: "websocket",
            metadata: [metadata]
        )
        connection.send(
            content: data,
            contentContext: context,
            isComplete: true,
            completion: .contentProcessed { error in
                if let error {
                    print("Send failed: \(error)")
                }
            }
        )
    }
}

// MARK: - Helper Types

private struct LanguageRequestPayload: Codable {
    let targetLanguage: String
    let deviceName: String
}
