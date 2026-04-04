import SwiftUI

/// Language selection screen for listeners — choose the target language
/// and output preferences (text, TTS, or both).
struct LanguageSelectionView: View {
    @Bindable var viewModel: ListenerViewModel
    @State private var showTranslationDisplay = false

    // Common languages shown first, rest in expandable section
    private let primaryLanguages: [SupportedLanguage] = [
        .english, .french, .italian, .spanish, .portuguese,
        .german, .japanese, .korean, .chinese
    ]

    var body: some View {
        List {
            // Language Selection
            Section("Meine Sprache") {
                ForEach(primaryLanguages) { language in
                    languageRow(language)
                }
            }

            // More Languages
            Section("Weitere Sprachen") {
                ForEach(SupportedLanguage.allCases.filter { !primaryLanguages.contains($0) }) { language in
                    languageRow(language)
                }
            }

            // Output Preferences
            Section("Ausgabe") {
                Toggle(isOn: .constant(true)) {
                    Label("Text anzeigen", systemImage: "text.alignleft")
                }
                .disabled(true) // Text is always shown

                Toggle(isOn: Binding(
                    get: { viewModel.ttsService.isEnabled },
                    set: { _ in viewModel.ttsService.toggle() }
                )) {
                    Label("Sprachausgabe (TTS)", systemImage: "speaker.wave.2.fill")
                }

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

            // Continue Button
            Section {
                Button {
                    showTranslationDisplay = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Weiter")
                            .font(.headline)
                        Image(systemName: "arrow.right")
                        Spacer()
                    }
                    .padding(.vertical, 4)
                }
                .buttonStyle(.borderedProminent)
                .listRowBackground(Color.clear)
            }
        }
        .navigationTitle("Sprache wahlen")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showTranslationDisplay) {
            TranslationDisplayView(viewModel: viewModel)
        }
    }

    private func languageRow(_ language: SupportedLanguage) -> some View {
        Button {
            viewModel.selectLanguage(language)
        } label: {
            HStack {
                Text(language.flag)
                    .font(.title3)
                Text(language.displayName)
                Spacer()
                if language == viewModel.selectedLanguage {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.blue)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
