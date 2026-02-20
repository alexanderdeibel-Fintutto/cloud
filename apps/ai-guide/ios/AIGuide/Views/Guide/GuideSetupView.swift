import SwiftUI
import Translation

/// Setup screen for the guide: choose source language, see connected listeners,
/// manage offline languages, and start the guiding session.
struct GuideSetupView: View {
    @State private var viewModel = GuideViewModel()
    @State private var showQRCode = false
    @State private var showLanguagePicker = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Source Language
                sourceLanguageSection

                // Session Status
                if viewModel.isSessionActive {
                    sessionInfoSection
                    connectedListenersSection
                    startGuidingButton
                } else {
                    createSessionButton
                }
            }
            .padding()
        }
        .navigationTitle("Fuhrung einrichten")
        .navigationBarTitleDisplayMode(.large)
        .navigationDestination(isPresented: $viewModel.isGuiding) {
            LiveGuidingView(viewModel: viewModel)
        }
        .sheet(isPresented: $showQRCode) {
            QRCodeView(
                sessionCode: viewModel.sessionServer.sessionCode,
                host: "localhost",
                port: viewModel.sessionServer.port
            )
            .presentationDetents([.medium])
        }
        // Attach translationTask modifiers for each requested language
        .translationTask(
            .init(
                source: viewModel.sourceLanguage.locale,
                target: Locale.Language(identifier: "en")
            )
        ) { session in
            viewModel.registerTranslationSession(session, for: .english)
        }
    }

    // MARK: - Sections

    private var sourceLanguageSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Meine Sprache")
                .font(.headline)

            Button {
                showLanguagePicker = true
            } label: {
                HStack {
                    Text(viewModel.sourceLanguage.flag)
                        .font(.title2)
                    Text(viewModel.sourceLanguage.displayName)
                        .font(.body)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .buttonStyle(.plain)
            .sheet(isPresented: $showLanguagePicker) {
                languagePickerSheet
            }
        }
    }

    private var sessionInfoSection: some View {
        VStack(spacing: 16) {
            // QR Code & Session Code
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Session aktiv")
                        .font(.headline)
                        .foregroundStyle(.green)
                    SessionCodeView(code: viewModel.sessionServer.sessionCode)
                }
                Spacer()
                Button {
                    showQRCode = true
                } label: {
                    Image(systemName: "qrcode")
                        .font(.title)
                        .padding()
                        .background(Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding()
            .background(.green.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private var connectedListenersSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "person.2.fill")
                Text("Verbundene Zuhoerer")
                    .font(.headline)
                Spacer()
                Text("\(viewModel.listenerCount)")
                    .font(.title2.bold())
            }

            if viewModel.listenerCount > 0 {
                // Breakdown by language
                ForEach(Array(viewModel.listenersByLanguage.sorted(by: { $0.value > $1.value })), id: \.key) { language, count in
                    HStack {
                        Text(language.flag)
                        Text(language.displayName)
                        Spacer()
                        Text("\(count)")
                            .foregroundStyle(.secondary)
                    }
                    .padding(.horizontal)
                }
            } else {
                Text("Warte auf Zuhoerer...")
                    .foregroundStyle(.secondary)
                    .italic()
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var createSessionButton: some View {
        Button {
            Task {
                try? await viewModel.createSession()
            }
        } label: {
            Label("Session erstellen", systemImage: "plus.circle.fill")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(.blue)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private var startGuidingButton: some View {
        Button {
            Task {
                try? await viewModel.startGuiding()
            }
        } label: {
            Label("Fuhrung starten", systemImage: "mic.fill")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(.green)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private var languagePickerSheet: some View {
        NavigationStack {
            List(SupportedLanguage.allCases) { language in
                Button {
                    viewModel.sourceLanguage = language
                    showLanguagePicker = false
                } label: {
                    HStack {
                        Text(language.flag)
                        Text(language.displayName)
                        Spacer()
                        if language == viewModel.sourceLanguage {
                            Image(systemName: "checkmark")
                                .foregroundStyle(.blue)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
            .navigationTitle("Sprache wahlen")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fertig") { showLanguagePicker = false }
                }
            }
        }
    }
}
