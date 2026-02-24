import SwiftUI

/// Displays the session code prominently for manual entry.
struct SessionCodeView: View {
    let code: String

    var body: some View {
        VStack(spacing: 8) {
            Text("Session-Code")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 4) {
                ForEach(Array(code.enumerated()), id: \.offset) { _, char in
                    Text(String(char))
                        .font(.title.monospaced().bold())
                        .frame(width: char == "-" ? 16 : 36, height: 48)
                        .background(char == "-" ? .clear : Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
    }
}
