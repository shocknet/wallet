const cacheModule = `
  <script type="text/javascript">
    const DB_NAME = "ShockWalletStore";

    const init = () =>
      new Promise((resolve, reject) => {
        browserFileStorage.init(DB_NAME)
          .then(() => {
            console.log("File cache initialized!");
            return browserFileStorage.persist();
          })
          .then(status => {
            if (status.persistent) {
              resolve(status);
            } else {
              reject(status);
            }
          });
      });

    const getCachedFile = async fileName => {
      try {
        if (!browserFileStorage._init) {
          await init();
        }

        const cachedFile = await browserFileStorage.load(fileName);
        return cachedFile.createURL();
      } catch (err) {
        console.warn(err);
        return false;
      }
    };

    const renderCachedFile = (fileURL, selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.src = fileURL;
      }
      return !!element;
    };

    const saveFile = (fileName, buffer) => {
      return browserFileStorage.save(fileName, buffer);
    };

    window.ShockCache = {
      DB_NAME,
      init,
      getCachedFile,
      renderCachedFile,
      saveFile
    };
  </script>
`

export default cacheModule
