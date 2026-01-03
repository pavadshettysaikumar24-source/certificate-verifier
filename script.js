const CONTRACT_ADDRESS = "0x6B0AA29aA991A81A417F62aD3d4278bDDA8B4c1f";

const ABI = [
  "function addCertificate(bytes32 hash, string cid) public",
  "function verifyCertificate(bytes32 hash) public view returns (bool, string)"
];

function normalize(regno, name, course, year) {
  return `${regno}|${name}|${course}|${year}`.toLowerCase().trim();
}

async function upload() {
  try {
    if (!window.ethereum) {
      alert("MetaMask required");
      return;
    }

    const regno  = document.getElementById("regno").value.trim();
    const name   = document.getElementById("name").value.trim();
    const course = document.getElementById("course").value.trim();
    const year   = document.getElementById("year").value.trim();
    const cid    = document.getElementById("cid").value.trim();

    const status = document.getElementById("status");
    const qrcode = document.getElementById("qrcode");

    if (!regno || !name || !course || !year || !cid) {
      alert("Fill all fields + CID");
      return;
    }

    // 🔐 AUTO-GENERATED HASH (ADMIN ONLY)
    const hash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(normalize(regno, name, course, year))
    );

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) {
      alert("Switch MetaMask to Sepolia");
      return;
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    status.innerText = "⛓️ Writing to blockchain...";
    const tx = await contract.addCertificate(hash, cid);
    await tx.wait();

    status.innerText = "✅ Certificate uploaded successfully";

    // ✅ AUTOMATED VERIFY URL (NO HASH IN QR)
    const verifyURL =
      `https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html` +
      `?regno=${encodeURIComponent(regno)}` +
      `&name=${encodeURIComponent(name)}` +
      `&course=${encodeURIComponent(course)}` +
      `&year=${encodeURIComponent(year)}`;

    qrcode.innerHTML = "";
    new QRCode(qrcode, {
      text: verifyURL,
      width: 200,
      height: 200
    });

  } catch (err) {
    console.error(err);
    alert("Upload failed — check console");
  }
}

