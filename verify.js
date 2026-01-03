const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

async function autoVerify(hash) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(
            "https://rpc.ankr.com/eth_sepolia"
        );

        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            provider
        );

        const valid = await contract.verifyCertificate(hash);

        const result = document.getElementById("result");

        if (valid) {
            result.innerText = "✅ Certificate is VALID";
            result.style.color = "lightgreen";
        } else {
            result.innerText = "❌ Certificate NOT FOUND";
            result.style.color = "red";
        }
    } catch (err) {
        document.getElementById("result").innerText =
            "⚠ Blockchain connection error";
        console.error(err);
    }
}

// Auto verify when QR opens page
const params = new URLSearchParams(window.location.search);
const hashFromQR = params.get("h");

if (hashFromQR) {
    autoVerify(hashFromQR);
}
