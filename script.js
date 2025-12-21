const contractAddress = "0x9d83e140330758a8fFD07F8Bd73e86ebcA8a5692";
const contractABI = [
    "function addCertificate(bytes32 hash) public",
    "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// Connect MetaMask
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask not installed");
        return null;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
}

// Upload Certificate
async function uploadCertificate() {
    const name = document.getElementById("name").value;
    const course = document.getElementById("course").value;
    const year = document.getElementById("year").value;
    if (!name || !course || !year) {
        alert("Fill all fields");
        return;
    }
    const hash = ethers.utils.id(name + course + year);
    const contract = await connectWallet();
    if (!contract) return;
    const tx = await contract.addCertificate(hash);
    await tx.wait();
    // Redirect to verify page with hash
    window.location.href = "verify.html?hash=" + hash;
}

// Verify Certificate
async function verifyCertificate() {
    const hash = document.getElementById("hash").value;
    if (!hash) {
        alert("Enter certificate hash");
        return;
    }
    const contract = await connectWallet();
    if (!contract) return;
    const isValid = await contract.verifyCertificate(hash);
    document.getElementById("result").innerText = isValid ? "Certificate is VALID" : "Certificate is NOT VALID";
}

// Auto-fill hash on verify page
window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("hash");
    if (hash && document.getElementById("hash")) {
        document.getElementById("hash").value = hash;
    }
};
