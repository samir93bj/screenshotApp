const { ipcRenderer, shell } = require("electron");

document.getElementById("capture").addEventListener("click", async () => {
  const url = document.getElementById("url").value;
  const format = document.getElementById("format").value;
  const status = document.getElementById("status");
  const error = document.getElementById("error"); // Asegúrate de obtener el elemento error

  status.textContent = "Capturing...";
  error.textContent = "";

  try {
    const filePath = await ipcRenderer.invoke("take-screenshot", {
      url,
      format,
    });

    status.innerHTML = `Screenshot saved to: <a href="#" id="open-file">${filePath}</a>`;

    document.getElementById("open-file").addEventListener("click", (e) => {
      e.preventDefault();
      shell.openPath(filePath);
    });
  } catch (err) {
    const errorMessage = err.message.split(":").pop().trim();
    status.textContent = "";
    error.textContent = `Error: ${errorMessage}`;
  }
});
