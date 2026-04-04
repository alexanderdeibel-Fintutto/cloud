import SwiftUI

/// The main guiding screen — shows live transcript, deploy button,
/// and translation status. This is where the guide spends most of their time.
struct LiveGuidingView: View {
    @Bindable var viewModel: GuideViewModel
    @State private var showEndConfirmation = false

    var body: some View {
        VStack(spacing: 0) {
            // Status Bar
            statusBar

            // Live Transcript
            transcriptArea

            // Last Translation Preview
            lastTranslationPreview

            // Deploy Button + Controls
            controlsArea
        }
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                HStack(spacing: 8) {
                    Circle()
                        .fill(.red)
                        .frame(width: 10, height: 10)
                        .opacity(viewModel.isGuiding ? 1 : 0.3)
                    Text("LIVE")
                        .font(.caption.bold())
                        .foregroundStyle(viewModel.isGuiding ? .red : .secondary)
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button("Beenden") {
                    showEndConfirmation = true
                }
                .foregroundStyle(.red)
            }
        }
        .alert("Fuhrung beenden?", isPresented: $showEndConfirmation) {
            Button("Abbrechen", role: .cancel) {}
            Button("Beenden", role: .destructive) {
                viewModel.endSession()
            }
        } message: {
            Text("Die Verbindung zu allen Zuhoerern wird getrennt.")
        }
    }

    // MARK: - Status Bar

    private var statusBar: some View {
        HStack {
            // Listener count
            HStack(spacing: 4) {
                Image(systemName: "person.2.fill")
                    .font(.caption)
                Text("\(viewModel.listenerCount)")
                    .font(.caption.bold())
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color(.systemGray6))
            .clipShape(Capsule())

            Spacer()

            // Timer
            Text(viewModel.formattedElapsedTime)
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)

            Spacer()

            // Languages
            HStack(spacing: 2) {
                ForEach(Array(viewModel.listenersByLanguage.keys.prefix(5)), id: \.self) { lang in
                    Text(lang.flag)
                        .font(.caption)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color(.systemGray6))
            .clipShape(Capsule())
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial)
    }

    // MARK: - Transcript Area

    private var transcriptArea: some View {
        ScrollView {
            ScrollViewReader { proxy in
                VStack(alignment: .leading, spacing: 16) {
                    // Previous finalized segments
                    ForEach(Array(viewModel.speechService.finalizedSegments.enumerated()), id: \.offset) { index, segment in
                        Text(segment)
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .padding(.horizontal)
                            .id("segment_\(index)")
                    }

                    // Current partial transcript
                    if !viewModel.speechService.partialTranscript.isEmpty {
                        Text(viewModel.speechService.partialTranscript)
                            .font(.title3)
                            .foregroundStyle(.primary)
                            .padding(.horizontal)
                            .id("current")
                    } else if viewModel.isGuiding {
                        Text("Sprich jetzt...")
                            .font(.title3)
                            .foregroundStyle(.tertiary)
                            .italic()
                            .padding(.horizontal)
                    }
                }
                .onChange(of: viewModel.speechService.partialTranscript) {
                    withAnimation {
                        proxy.scrollTo("current", anchor: .bottom)
                    }
                }
            }
        }
        .frame(maxHeight: .infinity)
    }

    // MARK: - Last Translation Preview

    private var lastTranslationPreview: some View {
        Group {
            if let lastChunk = viewModel.translationHistory.last {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("Zuletzt gesendet")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Spacer()
                        if let lang = SupportedLanguage(rawValue: lastChunk.targetLanguage) {
                            Text(lang.flag)
                        }
                    }
                    Text(lastChunk.translatedText)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                .padding()
                .background(Color(.systemGray6))
            }
        }
    }

    // MARK: - Controls Area

    private var controlsArea: some View {
        VStack(spacing: 16) {
            // DEPLOY Button — the central feature
            DeployButton {
                viewModel.deploy()
            }

            // Secondary controls
            HStack(spacing: 24) {
                Button {
                    if viewModel.isGuiding {
                        viewModel.pauseGuiding()
                    } else {
                        Task { try? await viewModel.startGuiding() }
                    }
                } label: {
                    Label(
                        viewModel.isGuiding ? "Pause" : "Fortsetzen",
                        systemImage: viewModel.isGuiding ? "pause.fill" : "play.fill"
                    )
                    .font(.subheadline)
                }
                .buttonStyle(.bordered)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
    }
}
