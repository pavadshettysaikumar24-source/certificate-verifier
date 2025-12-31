// Smart Contract Configuration
const contractAddress = "0x6d273FeEeF11edC2B5Ca29A51A56eF5a3389F44A";
const contractABI = [
    "function addCertificate(bytes32 hash) public",
    "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// Helper: Get Contract Instance
async function getContract() {
    if (!window.ethereum) {
        alert("MetaMask not installed. Please install MetaMask to continue.");
        return null;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert("Failed to connect to MetaMask: " + error.message);
        return null;
    }
}

// 🔐 Show Connected Admin Wallet (Upload page only)
async function showAdminWallet() {
    try {
        if (!window.ethereum) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        const walletEl = document.getElementById("adminWallet");
        if (walletEl) {
            walletEl.innerText = "Connected wallet: " + address;
        }
    } catch (err) {
        console.error("Wallet fetch error:", err);
    }
}

// Upload Certificate (Admin only)
async function uploadCertificate() {
    try {
        const name = document.getElementById("name").value.trim();
        const course = document.getElementById("course").value.trim();
        const year = document.getElementById("year").value.trim();

        if (!name || !course || !year) {
            alert("Please fill all fields");
            return;
        }

        // Generate deterministic hash
        const certId = name + "|" + course + "|" + year;
        const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(certId)
        );

        const contract = await getContract();
        if (!contract) return;

        // Disable upload button during tx
        const uploadBtn = document.querySelector("button");
        uploadBtn.disabled = true;
        uploadBtn.innerText = "Uploading...";

        const tx = await contract.addCertificate(hash);
        console.log("Transaction sent:", tx.hash);

        await tx.wait();
        console.log("Transaction confirmed");

        // Success message (clean UX)
        const statusEl = document.getElementById("uploadStatus");
        statusEl.innerText = "✅ Certificate uploaded successfully!";
        statusEl.style.color = "green";

        setTimeout(() => {
            window.location.href = "verify.html";
        }, 1500);

        uploadBtn.disabled = false;
        uploadBtn.innerText = "Upload";

    } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload certificate: " + error.message);
    }
}

// Verify Certificate (Public)
async function verifyCertificate() {
    try {
        const name = document.getElementById("name").value.trim();
        const course = document.getElementById("course").value.trim();
        const year = document.getElementById("year").value.trim();

        if (!name || !course || !year) {
            alert("Please fill all fields");
            return;
        }

        // Regenerate same hash
        const certId = name + "|" + course + "|" + year;
        const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(certId)
        );

        const contract = await getContract();
        if (!contract) return;

        const isValid = await contract.verifyCertificate(hash);
        console.log("Verification result:", isValid);

        const resultElement = document.getElementById("result");
        if (isValid) {
            resultElement.innerText = "✅ Certificate is VALID";
            resultElement.style.color = "green";
        } else {
            resultElement.innerText = "❌ Certificate is NOT VALID";
            resultElement.style.color = "red";
        }

    } catch (error) {
        console.error("Verification error:", error);
        alert("Failed to verify certificate: " + error.message);
    }
}

// Expose functions globally
window.uploadCertificate = uploadCertificate;
window.verifyCertificate = verifyCertificate;

// Auto-run on page load
window.addEventListener("load", showAdminWallet);
