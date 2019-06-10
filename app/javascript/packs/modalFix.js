window.onload = () => {
  const modalButton = document.querySelector("#modalButton");
  modalButton.addEventListener("click", () => {
    setTimeout(function() {
      document.querySelector(".modal-backdrop").style.display = "none";
    }, 500);
  });
};
