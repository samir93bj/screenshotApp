const { ipcRenderer, shell } = require("electron");

/**
 * listen for the "screenshot-captured" event and update the UI with the file path
 */
document.getElementById("capture").addEventListener("click", async () => {
  const url = document.getElementById("url").value;
  const format = document.getElementById("format").value;
  const status = document.getElementById("status");
  const error = document.getElementById("error");

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
