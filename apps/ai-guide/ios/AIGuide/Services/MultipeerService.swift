import Foundation
import MultipeerConnectivity

/// Handles iOS-to-iOS device discovery and connection via Multipeer Connectivity.
/// Used as an alternative/complement to the WebSocket server for automatic
/// nearby device discovery without requiring WiFi configuration.
@Observable
final class MultipeerService: NSObject {
    // MARK: - Constants

    static let serviceType = "aiguide-tour" // max 15 chars, lowercase + hyphens

    // MARK: - State

    var isAdvertising: Bool = false
    var isBrowsing: Bool = false
    var discoveredGuides: [MCPeerID] = []
    var connectedPeers: [MCPeerID] = []

    // MARK: - Private

    private let myPeerID: MCPeerID
    private var session: MCSession?
    private var advertiser: MCNearbyServiceAdvertiser?
    private var browser: MCNearbyServiceBrowser?

    /// Callback for received data
    var onDataReceived: ((Data, MCPeerID) -> Void)?

    /// Callback when a guide session is discovered (for listeners)
    var onGuideDiscovered: ((MCPeerID, [String: String]?) -> Void)?

    // MARK: - Init

    override init() {
        self.myPeerID = MCPeerID(displayName: UIDevice.current.name)
        super.init()
    }

    // MARK: - Guide API

    /// Start advertising this device as a guide (for nearby discovery).
    func startAdvertising(sessionCode: String, guideName: String) {
        session = MCSession(peer: myPeerID, securityIdentity: nil, encryptionPreference: .required)
        session?.delegate = self

        let info: [String: String] = [
            "sessionCode": sessionCode,
            "guideName": guideName,
            "role": "guide"
        ]

        advertiser = MCNearbyServiceAdvertiser(
            peer: myPeerID,
            discoveryInfo: info,
            serviceType: Self.serviceType
        )
        advertiser?.delegate = self
        advertiser?.startAdvertisingPeer()
        isAdvertising = true
    }

    /// Stop advertising.
    func stopAdvertising() {
        advertiser?.stopAdvertisingPeer()
        advertiser = nil
        isAdvertising = false
    }

    // MARK: - Listener API

    /// Start browsing for nearby guide sessions.
    func startBrowsing() {
        session = MCSession(peer: myPeerID, securityIdentity: nil, encryptionPreference: .required)
        session?.delegate = self

        browser = MCNearbyServiceBrowser(peer: myPeerID, serviceType: Self.serviceType)
        browser?.delegate = self
        browser?.startBrowsingForPeers()
        isBrowsing = true
    }

    /// Stop browsing.
    func stopBrowsing() {
        browser?.stopBrowsingForPeers()
        browser = nil
        isBrowsing = false
    }

    /// Connect to a discovered guide.
    func connectToGuide(_ peer: MCPeerID) {
        guard let browser, let session else { return }
        browser.invitePeer(peer, to: session, withContext: nil, timeout: 30)
    }

    // MARK: - Shared API

    /// Send data to all connected peers.
    func sendToAll(_ data: Data) {
        guard let session, !session.connectedPeers.isEmpty else { return }
        try? session.send(data, toPeers: session.connectedPeers, with: .reliable)
    }

    /// Send data to a specific peer.
    func send(_ data: Data, to peer: MCPeerID) {
        guard let session else { return }
        try? session.send(data, toPeers: [peer], with: .reliable)
    }

    /// Disconnect and clean up.
    func disconnect() {
        stopAdvertising()
        stopBrowsing()
        session?.disconnect()
        session = nil
        discoveredGuides.removeAll()
        connectedPeers.removeAll()
    }
}

// MARK: - MCSessionDelegate

extension MultipeerService: MCSessionDelegate {
    func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
        Task { @MainActor in
            switch state {
            case .connected:
                if !connectedPeers.contains(peerID) {
                    connectedPeers.append(peerID)
                }
            case .notConnected:
                connectedPeers.removeAll { $0 == peerID }
            case .connecting:
                break
            @unknown default:
                break
            }
        }
    }

    func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
        onDataReceived?(data, peerID)
    }

    func session(_ session: MCSession, didReceive stream: InputStream, withName streamName: String, fromPeer peerID: MCPeerID) {}
    func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, with progress: Progress) {}
    func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {}
}

// MARK: - MCNearbyServiceAdvertiserDelegate

extension MultipeerService: MCNearbyServiceAdvertiserDelegate {
    func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID, withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
        // Auto-accept connections from listeners
        invitationHandler(true, session)
    }

    func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didNotStartAdvertisingPeer error: Error) {
        print("Advertising failed: \(error)")
        Task { @MainActor in
            isAdvertising = false
        }
    }
}

// MARK: - MCNearbyServiceBrowserDelegate

extension MultipeerService: MCNearbyServiceBrowserDelegate {
    func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID, withDiscoveryInfo info: [String: String]?) {
        guard info?["role"] == "guide" else { return }
        Task { @MainActor in
            if !discoveredGuides.contains(peerID) {
                discoveredGuides.append(peerID)
            }
            onGuideDiscovered?(peerID, info)
        }
    }

    func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
        Task { @MainActor in
            discoveredGuides.removeAll { $0 == peerID }
        }
    }

    func browser(_ browser: MCNearbyServiceBrowser, didNotStartBrowsingForPeers error: Error) {
        print("Browsing failed: \(error)")
        Task { @MainActor in
            isBrowsing = false
        }
    }
}
