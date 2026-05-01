(function () {
  if (window.FeedbackWidget && window.FeedbackWidget.__initialized) {
    return;
  }

  function getCurrentScript() {
    return document.currentScript || document.querySelector("script[data-base-url]");
  }

  function createWidget(config) {
    var button = document.createElement("button");
    var overlay = document.createElement("div");
    var panel = document.createElement("div");
    var closeButton = document.createElement("button");
    var iframe = document.createElement("iframe");

    var positionStyles =
      config.position === "bottom-left"
        ? { left: "24px", right: "auto" }
        : { right: "24px", left: "auto" };

    button.type = "button";
    button.textContent = config.label || "Share feedback";
    button.setAttribute("aria-label", button.textContent);
    button.style.position = "fixed";
    button.style.bottom = "24px";
    button.style[positionStyles.left ? "left" : "right"] = positionStyles.left || positionStyles.right;
    button.style.zIndex = "2147483646";
    button.style.border = "0";
    button.style.borderRadius = "999px";
    button.style.padding = "14px 18px";
    button.style.font = "600 14px system-ui, sans-serif";
    button.style.background = config.brandColor || "#2563eb";
    button.style.color = "#fff";
    button.style.boxShadow = "0 20px 45px rgba(15, 23, 42, 0.25)";
    button.style.cursor = "pointer";

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(15, 23, 42, 0.45)";
    overlay.style.backdropFilter = "blur(4px)";
    overlay.style.zIndex = "2147483647";
    overlay.style.padding = "16px";

    panel.style.position = "relative";
    panel.style.width = "min(100%, 420px)";
    panel.style.height = "min(100%, 760px)";
    panel.style.borderRadius = "28px";
    panel.style.overflow = "hidden";
    panel.style.background = "#fff";
    panel.style.boxShadow = "0 24px 80px rgba(15, 23, 42, 0.3)";

    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.style.position = "absolute";
    closeButton.style.top = "12px";
    closeButton.style.right = "12px";
    closeButton.style.zIndex = "2";
    closeButton.style.border = "0";
    closeButton.style.borderRadius = "999px";
    closeButton.style.padding = "8px 12px";
    closeButton.style.background = "rgba(15, 23, 42, 0.7)";
    closeButton.style.color = "#fff";
    closeButton.style.cursor = "pointer";

    iframe.title = "Feedback widget";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.background = "#fff";

    var iframeUrl = new URL("/widget", config.baseUrl);
    if (config.token) iframeUrl.searchParams.set("token", config.token);
    if (config.tab) iframeUrl.searchParams.set("tab", config.tab);
    iframe.src = iframeUrl.toString();

    function open() {
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    }

    function close() {
      overlay.style.display = "none";
      document.body.style.overflow = "";
    }

    button.addEventListener("click", open);
    closeButton.addEventListener("click", close);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) close();
    });
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });

    panel.appendChild(closeButton);
    panel.appendChild(iframe);
    overlay.appendChild(panel);
    document.body.appendChild(button);
    document.body.appendChild(overlay);

    return { open: open, close: close };
  }

  var script = getCurrentScript();
  var dataset = script ? script.dataset : {};

  window.FeedbackWidget = {
    __initialized: true,
    init: function (overrides) {
      return createWidget({
        baseUrl: (overrides && overrides.baseUrl) || dataset.baseUrl || window.location.origin,
        token: (overrides && overrides.token) || dataset.token || "",
        position: (overrides && overrides.position) || dataset.position || "bottom-right",
        label: (overrides && overrides.label) || dataset.label || "Share feedback",
        brandColor: (overrides && overrides.brandColor) || dataset.brandColor || "#2563eb",
        tab: (overrides && overrides.tab) || dataset.tab || "submit",
      });
    },
  };

  window.FeedbackWidget.init();
})();
