import SwiftUI

/// The famous DEPLOY button — the guide presses this to immediately
/// send the current accumulated speech for translation, without waiting
/// for automatic sentence detection.
///
/// Design: Large, tactile, impossible to miss. The guide operates this
/// with one hand while speaking, often without looking at the screen.
struct DeployButton: View {
    let action: () -> Void

    @State private var isPressed = false
    @State private var pulseScale: CGFloat = 1.0

    var body: some View {
        Button {
            action()
            triggerHaptic()
        } label: {
            ZStack {
                // Outer pulse ring (animates on press)
                Circle()
                    .stroke(Color.blue.opacity(0.3), lineWidth: 3)
                    .frame(width: 120, height: 120)
                    .scaleEffect(pulseScale)

                // Main button
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.blue, .blue.opacity(0.8)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 100, height: 100)
                    .shadow(color: .blue.opacity(0.4), radius: isPressed ? 5 : 15)
                    .scaleEffect(isPressed ? 0.92 : 1.0)

                // Icon & Label
                VStack(spacing: 4) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 28))
                    Text("DEPLOY")
                        .font(.caption.bold())
                }
                .foregroundStyle(.white)
            }
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.easeInOut(duration: 0.1)) {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    withAnimation(.easeInOut(duration: 0.1)) {
                        isPressed = false
                    }
                    // Pulse animation
                    withAnimation(.easeOut(duration: 0.5)) {
                        pulseScale = 1.3
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        pulseScale = 1.0
                    }
                }
        )
        .accessibilityLabel("Deploy translation")
        .accessibilityHint("Send current speech for translation")
    }

    private func triggerHaptic() {
        let impact = UIImpactFeedbackGenerator(style: .heavy)
        impact.impactOccurred()
    }
}
