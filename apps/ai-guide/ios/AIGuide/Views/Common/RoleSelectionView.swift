import SwiftUI

struct RoleSelectionView: View {
    @Binding var selectedRole: AppRole?

    var body: some View {
        VStack(spacing: 40) {
            Spacer()

            // App Logo & Title
            VStack(spacing: 12) {
                Image(systemName: "waveform.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.blue)

                Text("AI-Guide")
                    .font(.largeTitle.bold())

                Text("Live-Ubersetzung fur Fuhrungen")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Role Selection Buttons
            VStack(spacing: 16) {
                Button {
                    selectedRole = .guide
                } label: {
                    HStack(spacing: 16) {
                        Image(systemName: "mic.fill")
                            .font(.title2)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Ich bin Guide")
                                .font(.headline)
                            Text("Fuhrung starten & ubersetzen")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(.blue.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(.plain)

                Button {
                    selectedRole = .listener
                } label: {
                    HStack(spacing: 16) {
                        Image(systemName: "ear.fill")
                            .font(.title2)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Ich bin Zuhoerer")
                                .font(.headline)
                            Text("Einer Fuhrung beitreten")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(.green.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal)

            Spacer()

            Text("by Fintutto")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding()
    }
}
