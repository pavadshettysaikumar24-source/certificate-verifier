const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

async function autoVerify() {
    try {
        const params = new URLSearchParams(window.location.search);
        const hash = params.get("h");

        if (!hash) {
            document.getElementById("result").innerText = "❌ Invalid QR Code";
            return;
        }

        // ✅ PUBLIC RPC (NO METAMASK)
        const provider = new ethers.providers.JsonRpcProvider(
            "https://rpc.ankr.com/eth_sepolia"
        );

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const isValid = await contract.verifyCertificate(hash);

        const result = document.getElementById("result");

        if (isValid) {
            result.innerText = "✅ Certificate is VALID";
            result.style.color = "lime";
        } else {
            result.innerText = "❌ Certificate NOT FOUND";
            result.style.color = "red";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("result").innerText =
            "⚠ Blockchain connection error";
    }
}

autoVerify();
