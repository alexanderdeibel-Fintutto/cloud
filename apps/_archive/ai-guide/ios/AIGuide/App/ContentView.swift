import SwiftUI

struct ContentView: View {
    @State private var selectedRole: AppRole?

    var body: some View {
        NavigationStack {
            if let role = selectedRole {
                switch role {
                case .guide:
                    GuideSetupView()
                case .listener:
                    JoinSessionView()
                }
            } else {
                RoleSelectionView(selectedRole: $selectedRole)
            }
        }
    }
}

enum AppRole {
    case guide
    case listener
}
