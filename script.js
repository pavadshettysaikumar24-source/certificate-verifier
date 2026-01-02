const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function addCertificate(bytes32 hash) public",
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ✅ NORMALIZATION (UPDATED)
function normalize(regno, name, course, year) {
    return `${regno.trim().toLowerCase()}|${name.trim().toLowerCase()}|${course.trim().toLowerCase()}|${year.trim()}`;
}

/* ================= ADMIN ================= */

async function upload() {
    if (!window.ethereum) {
        alert("MetaMask required for admin");
        return;
    }

    const regno  = document.getElementById("regno").value;
    const name   = document.getElementById("name").value;
    const course = document.getElementById("course").value;
    const year   = document.getElementById("year").value;

    if (!regno || !name || !course || !year) {
        alert("Fill all fields");
        return;
    }

    const certData = normalize(regno, name, course, year);
    const hash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(certData)
    );

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    document.getElementById("status").innerText = "⏳ Uploading to blockchain...";

    const tx = await contract.addCertificate(hash);
    await tx.wait();

    document.getElementById("status").innerText =
        "✅ Certificate uploaded successfully";

    const verifyURL =
        `https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html?h=${hash}`;

    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: verifyURL,
        width: 200,
        height: 200
    });
}
