import SwiftUI

/// Entry screen for listeners — join a guide's session via QR code,
/// session code, or automatic nearby discovery.
struct JoinSessionView: View {
    @State private var viewModel = ListenerViewModel()
    @State private var manualCode: String = ""
    @State private var showScanner = false
    @State private var showLanguageSelection = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "ear.fill")
                        .font(.system(size: 50))
                        .foregroundStyle(.green)
                    Text("Fuhrung beitreten")
                        .font(.title2.bold())
                }
                .padding(.top)

                // QR Code Scanner
                qrScannerSection

                // Manual Code Entry
                manualCodeSection

                // Nearby Discovery
                nearbyDiscoverySection
            }
            .padding()
        }
        .navigationTitle("Beitreten")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showLanguageSelection) {
            LanguageSelectionView(viewModel: viewModel)
        }
    }

    // MARK: - Sections

    private var qrScannerSection: some View {
        Button {
            showScanner = true
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "qrcode.viewfinder")
                    .font(.title2)
                VStack(alignment: .leading) {
                    Text("QR-Code scannen")
                        .font(.headline)
                    Text("Scanne den Code vom Guide-Geraet")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showScanner) {
            // QR Scanner would be implemented here using AVCaptureSession
            Text("QR Scanner")
                .font(.title)
                .presentationDetents([.large])
        }
    }

    private var manualCodeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Oder Code eingeben")
                .font(.headline)

            HStack(spacing: 12) {
                TextField("AG-XXXX", text: $manualCode)
                    .font(.title3.monospaced())
                    .textFieldStyle(.roundedBorder)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.characters)

                Button("Verbinden") {
                    connectWithCode()
                }
                .buttonStyle(.borderedProminent)
                .disabled(manualCode.count < 6)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var nearbyDiscoverySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("In der Naehe")
                    .font(.headline)
                Spacer()
                if viewModel.multipeerService.isBrowsing {
                    ProgressView()
                        .scaleEffect(0.8)
                }
            }

            if viewModel.multipeerService.discoveredGuides.isEmpty {
                Button {
                    viewModel.connectViaMultipeer()
                } label: {
                    HStack {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                        Text("Nach Fuhrungen suchen...")
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(.systemGray5))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
            } else {
                ForEach(viewModel.multipeerService.discoveredGuides, id: \.displayName) { guide in
                    Button {
                        viewModel.multipeerService.connectToGuide(guide)
                        showLanguageSelection = true
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "person.wave.2.fill")
                                .font(.title3)
                                .foregroundStyle(.green)
                            VStack(alignment: .leading) {
                                Text(guide.displayName)
                                    .font(.body.bold())
                                Text("Tippen zum Verbinden")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(.secondary)
                        }
                        .padding()
                        .background(.green.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Actions

    private func connectWithCode() {
        // In production: resolve the session code to a host:port via Bonjour or a lookup service
        // For now, navigate to language selection
        showLanguageSelection = true
    }
}
