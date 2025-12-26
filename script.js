// Debug: Verify script loading
alert("script.js loaded successfully!");

// Smart Contract Configuration
const contractAddress = "0x4426b784E1DDAB879071673d72182c27a9b3e2aa";
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

// Upload Certificate
async function uploadCertificate() {
    try {
        // Get and trim inputs
        const name = document.getElementById("name").value.trim();
        const course = document.getElementById("course").value.trim();
        const year = document.getElementById("year").value.trim();
        
        // Validate inputs
        if (!name || !course || !year) {
            alert("Please fill all fields");
            return;
        }
        
        // Generate deterministic hash
       const certId = name + "|" + course + "|" + year;
const hash = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes(certId)
);

        
        // Get contract instance
        const contract = await getContract();
        if (!contract) return;
        
        // Submit transaction
        const tx = await contract.addCertificate(hash);
        console.log("Transaction sent:", tx.hash);
        
        // Wait for confirmation
        await tx.wait();
        console.log("Transaction confirmed");
        
        alert("Certificate uploaded successfully!");
        window.location.href = "verify.html";

        
        // Optional: Redirect to verify page with hash
        // window.location.href = "verify.html?hash=" + hash;
        
    } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload certificate: " + error.message);
    }
}

// Verify Certificate
async function verifyCertificate() {
    try {
        // Get and trim inputs
        const name = document.getElementById("name").value.trim();
        const course = document.getElementById("course").value.trim();
        const year = document.getElementById("year").value.trim();
        
        // Validate inputs
        if (!name || !course || !year) {
            alert("Please fill all fields");
            return;
        }
        
        // Regenerate the SAME hash using the SAME formula
      const certId = name + "|" + course + "|" + year;
const hash = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes(certId)
);

        
        // Get contract instance
        const contract = await getContract();
        if (!contract) return;
        
        // Call verification function
        const isValid = await contract.verifyCertificate(hash);
        console.log("Verification result:", isValid);
        
        // Display result clearly
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
window.uploadCertificate = uploadCertificate;
window.verifyCertificate = verifyCertificate;

