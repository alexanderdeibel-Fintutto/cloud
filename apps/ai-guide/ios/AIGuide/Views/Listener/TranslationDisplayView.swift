import SwiftUI

/// Main listener view — displays translated text as it arrives from the guide.
/// Designed for readability: large text, dark background option, minimal UI.
/// The listener keeps this screen open during the entire tour.
struct TranslationDisplayView: View {
    @Bindable var viewModel: ListenerViewModel
    @State private var useDarkBackground = true
    @State private var showHistory = false
    @State private var showSettings = false

    var body: some View {
        ZStack {
            // Background
            (useDarkBackground ? Color.black : Color(.systemBackground))
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Connection Status Bar
                connectionBar

                // Main Translation Area
                translationArea

                // Bottom Controls
                bottomControls
            }
        }
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    viewModel.disconnect()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.gray)
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                HStack(spacing: 12) {
                    Button {
                        showHistory = true
                    } label: {
                        Image(systemName: "clock.arrow.circlepath")
                            .foregroundStyle(.gray)
                    }
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "gearshape")
                            .foregroundStyle(.gray)
                    }
                }
            }
        }
        .toolbarBackground(.hidden, for: .navigationBar)
        .sheet(isPresented: $showHistory) {
            historySheet
        }
        .sheet(isPresented: $showSettings) {
            settingsSheet
        }
        .onDisappear {
            viewModel.disconnect()
        }
    }

    // MARK: - Connection Bar

    private var connectionBar: some View {
        HStack {
            Circle()
                .fill(viewModel.isConnected ? .green : .red)
                .frame(width: 8, height: 8)

            Text(viewModel.isConnected ? viewModel.guideName : "Verbindung unterbrochen")
                .font(.caption)
                .foregroundStyle(useDarkBackground ? .white.opacity(0.6) : .secondary)

            Spacer()

            Text("\(viewModel.selectedLanguage.flag) \(viewModel.selectedLanguage.displayName)")
                .font(.caption)
                .foregroundStyle(useDarkBackground ? .white.opacity(0.6) : .secondary)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    // MARK: - Translation Area

    private var translationArea: some View {
        ScrollView {
            ScrollViewReader { proxy in
                VStack(alignment: .leading, spacing: 24) {
                    Spacer(minLength: 40)

                    // Previous translations (faded)
                    ForEach(Array(viewModel.translationHistory.dropLast(1).suffix(3).enumerated()), id: \.offset) { index, chunk in
                        Text(chunk.translatedText)
                            .font(.system(size: viewModel.fontSize - 4))
                            .foregroundStyle(useDarkBackground ? .white.opacity(0.3) : .secondary)
                            .padding(.horizontal)
                            .id("history_\(index)")
                    }

                    // Current translation (prominent)
                    if !viewModel.currentTranslation.isEmpty {
                        Text(viewModel.currentTranslation)
                            .font(.system(size: viewModel.fontSize, weight: .medium))
                            .foregroundStyle(useDarkBackground ? .white : .primary)
                            .padding(.horizontal)
                            .id("current")
                            .transition(.opacity.combined(with: .move(edge: .bottom)))
                    } else {
                        VStack(spacing: 12) {
                            Image(systemName: "waveform")
                                .font(.system(size: 40))
                                .foregroundStyle(useDarkBackground ? .white.opacity(0.2) : .tertiary)
                            Text("Warte auf Ubersetzung...")
                                .font(.body)
                                .foregroundStyle(useDarkBackground ? .white.opacity(0.3) : .tertiary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, 100)
                    }

                    Spacer(minLength: 60)
                }
                .onChange(of: viewModel.currentTranslation) {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        proxy.scrollTo("current", anchor: .center)
                    }
                }
            }
        }
        .frame(maxHeight: .infinity)
    }

    // MARK: - Bottom Controls

    private var bottomControls: some View {
        HStack(spacing: 24) {
            // TTS Toggle
            Button {
                viewModel.ttsService.toggle()
            } label: {
                Image(systemName: viewModel.ttsService.isEnabled ? "speaker.wave.2.fill" : "speaker.slash.fill")
                    .font(.title3)
                    .foregroundStyle(viewModel.ttsService.isEnabled ? .blue : .gray)
            }

            Spacer()

            // Font Size Controls
            Button {
                viewModel.decreaseFontSize()
            } label: {
                Image(systemName: "textformat.size.smaller")
                    .foregroundStyle(.gray)
            }

            Text("\(Int(viewModel.fontSize))")
                .font(.caption.monospaced())
                .foregroundStyle(.gray)

            Button {
                viewModel.increaseFontSize()
            } label: {
                Image(systemName: "textformat.size.larger")
                    .foregroundStyle(.gray)
            }

            Spacer()

            // Dark/Light Toggle
            Button {
                withAnimation {
                    useDarkBackground.toggle()
                }
            } label: {
                Image(systemName: useDarkBackground ? "sun.max.fill" : "moon.fill")
                    .font(.title3)
                    .foregroundStyle(.gray)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
    }

    // MARK: - History Sheet

    private var historySheet: some View {
        NavigationStack {
            List(viewModel.translationHistory.reversed()) { chunk in
                VStack(alignment: .leading, spacing: 4) {
                    Text(chunk.translatedText)
                        .font(.body)
                    Text(chunk.sourceText)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(chunk.timestamp, style: .time)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
                .padding(.vertical, 4)
            }
            .navigationTitle("Verlauf")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fertig") { showHistory = false }
                }
            }
        }
    }

    // MARK: - Settings Sheet

    private var settingsSheet: some View {
        NavigationStack {
            List {
                Section("Sprache") {
                    ForEach(SupportedLanguage.allCases.prefix(10)) { language in
                        Button {
                            viewModel.selectLanguage(language)
                        } label: {
                            HStack {
                                Text(language.flag)
                                Text(language.displayName)
                                Spacer()
                                if language == viewModel.selectedLanguage {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(.blue)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }

                Section("Anzeige") {
                    HStack {
                        Text("Schriftgroesse")
                        Slider(value: $viewModel.fontSize, in: 14...48, step: 2)
                    }

                    Toggle("Dunkler Hintergrund", isOn: $useDarkBackground)
                }

                Section("Audio") {
                    Toggle("Sprachausgabe", isOn: Binding(
                        get: { viewModel.ttsService.isEnabled },
                        set: { _ in viewModel.ttsService.toggle() }
                    ))

                    if viewModel.ttsService.isEnabled {
                        HStack {
                            Text("Geschwindigkeit")
                            Slider(
                                value: Binding(
                                    get: { viewModel.ttsService.speechRate },
                                    set: { viewModel.ttsService.setRate($0) }
                                ),
                                in: 0.3...0.6,
                                step: 0.05
                            )
                        }
                    }
                }
            }
            .navigationTitle("Einstellungen")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fertig") { showSettings = false }
                }
            }
        }
    }
}
