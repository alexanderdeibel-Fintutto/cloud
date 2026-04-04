import SwiftUI
import CoreImage.CIFilterBuiltins

/// Generates and displays a QR code for the session.
struct QRCodeView: View {
    let sessionCode: String
    let host: String
    let port: UInt16

    var body: some View {
        VStack(spacing: 16) {
            if let qrImage = generateQRCode() {
                Image(uiImage: qrImage)
                    .interpolation(.none)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 200, height: 200)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Text(sessionCode)
                .font(.title.monospaced().bold())
                .foregroundStyle(.primary)

            Text("Zuhoerer scannen diesen Code")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }

    private func generateQRCode() -> UIImage? {
        let connectionString = "aiguide://\(host):\(port)/\(sessionCode)"

        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(connectionString.utf8)
        filter.correctionLevel = "M"

        guard let outputImage = filter.outputImage else { return nil }

        let scale = 10.0
        let scaledImage = outputImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

        guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else {
            return nil
        }

        return UIImage(cgImage: cgImage)
    }
}
