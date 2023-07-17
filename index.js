let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);

if (urlParams.has("passeport")) {
  let passportBase = urlParams.get("passeport");
  checkPassport(passportBase);
}

const checkBtn = document.querySelector(".check-btn");

checkBtn.onclick = () => {
  let passportBase = document.querySelector("#passport-base-input").value;

  if (passportBase == "") {
    //check qr code from image upload
    let imageFile = document.querySelector("#passport-upload").files[0];
    if (imageFile == undefined) {
      return;
    }
    readQRCodeFromImage(imageFile).then((passportBase) => {
      checkPassport(passportBase);
    });
  } else {
    checkPassport(passportBase);
  }
};

function checkPassport(passportBase) {
  let passportInfo = atob(passportBase).split(",");
  if (passportInfo.length != 11) {
    passportResult(false, []);
    return;
  }
  if (parseInt(passportInfo[1]) == NaN) {
    passportResult(false, []);
    return;
  }

  let bDate = dateFromFrenchShorthand(passportInfo[4]);
  if (bDate == "Invalid Date") {
    passportResult(false, []);
    return;
  }

  let expiryDate = dateFromFrenchShorthand(passportInfo[8]);
  if (expiryDate == "Invalid Date") {
    passportResult(false, []);
    return;
  } else if (expiryDate < new Date()) {
    passportResult(false, []);
    return;
  }

  passportResult(true, passportInfo);
}

function passportResult(checkResult, passportInfo) {
  let container = document.querySelector(".result-container");

  container.innerHTML = "";

  let resultIdentifier = document.createElement("div");
  resultIdentifier.classList.add("result-identifier");
  resultIdentifier.classList.add(checkResult ? "success" : "failure");
  resultIdentifier.innerText = checkResult ? "Valide" : "Invalide";

  container.appendChild(resultIdentifier);

  if (!checkResult) {
    return;
  }

  let resultInfo = document.createElement("div");
  resultInfo.classList.add("result-info");

  let passportNum = document.createElement("div");
  passportNum.classList.add("shbox");

  let passportNumLabel = document.createElement("div");
  passportNumLabel.innerText = "Numéro de passeport: ";
  passportNum.appendChild(passportNumLabel);

  let passportNumContent = document.createElement("div");
  passportNumContent.innerText = passportInfo[1];
  passportNum.appendChild(passportNumContent);

  resultInfo.appendChild(passportNum);

  let passportName = document.createElement("div");
  passportName.classList.add("shbox");

  let passportNameLabel = document.createElement("div");
  passportNameLabel.innerText = "Nom: ";
  passportName.appendChild(passportNameLabel);

  let passportNameContent = document.createElement("div");
  passportNameContent.innerText = passportInfo[3] + " " + passportInfo[2];
  passportName.appendChild(passportNameContent);

  resultInfo.appendChild(passportName);

  let passportBDay = document.createElement("div");
  passportBDay.classList.add("shbox");

  let passportBDayLabel = document.createElement("div");
  passportBDayLabel.innerText = "Date de naissance: ";
  passportBDay.appendChild(passportBDayLabel);

  let bDayString = frenchDateStringFromShorthand(passportInfo[4]);

  let passportBDayContent = document.createElement("div");
  passportBDayContent.innerText = bDayString;
  passportBDay.appendChild(passportBDayContent);

  resultInfo.appendChild(passportBDay);

  let passportExpiration = document.createElement("div");
  passportExpiration.classList.add("shbox");

  let passportExpirationLabel = document.createElement("div");
  passportExpirationLabel.innerText = "Date d'expiration: ";
  passportExpiration.appendChild(passportExpirationLabel);

  let expirationString = frenchDateStringFromShorthand(passportInfo[8]);

  let passportExpirationContent = document.createElement("div");
  passportExpirationContent.innerText = expirationString;
  passportExpiration.appendChild(passportExpirationContent);

  resultInfo.appendChild(passportExpiration);

  container.appendChild(resultInfo);
}

function frenchDateStringFromShorthand(dateString) {
  let date = dateFromFrenchShorthand(dateString);
  let frenchDateString = date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return frenchDateString;
}

function dateFromFrenchShorthand(dateString) {
  let dateParts = dateString.split("/");
  let date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

  return date;
}

function readQRCodeFromImage(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, image.width, image.height);
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          resolve(code.data);
        } else {
          resolve(false);
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(imageFile);
  });
}

function handleFileDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  let imageFile = event.dataTransfer.files[0];

  readQRCodeFromImage(imageFile).then((passportBase) => {
    if (passportBase == false) {
      checkPassport("");
    } else {
      checkPassport(passportBase);
    }
  });
}

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();

  document.querySelector(".upload-container").classList.add("dragover");
}