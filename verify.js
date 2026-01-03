const CONTRACT_ADDRESS = "0x6B0AA29aA991A81A417F62aD3d4278bDDA8B4c1f";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool, string)"
];

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_sepolia"
);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function autoVerify() {
    const hash = new URLSearchParams(window.location.search).get("h");
    const status = document.getElementById("status");

    if (!hash) {
        status.innerText = "❌ Invalid QR";
        status.className = "error";
        return;
    }

    try {
        const [valid, cid] = await contract.verifyCertificate(hash);

        if (valid) {
            status.innerHTML = `
              ✅ Certificate VERIFIED<br><br>
              <a href="https://gateway.pinata.cloud/ipfs/${cid}" target="_blank">
                📄 View Certificate PDF
              </a>
            `;
            status.className = "success";
        } else {
            status.innerText = "❌ Certificate not found";
            status.className = "error";
        }

    } catch (e) {
        console.error(e);
        status.innerText = "❌ Blockchain connection error";
        status.className = "error";
    }
}

autoVerify();
