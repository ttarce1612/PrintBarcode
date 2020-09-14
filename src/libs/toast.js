/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

module.exports = {
  success: (message) => {
      let event = new CustomEvent("toast_message", {
          detail: {
            type: "success",
            message: message
          }
        });
        document.dispatchEvent(event);
  },
  error: (message) => {
      let event = new CustomEvent("toast_message", {
          detail: {
            type: "error",
            message: message
          }
        });
        document.dispatchEvent(event);
  },
  info: (message) => {
      let event = new CustomEvent("toast_message", {
          detail: {
            type: "info",
            message: message
          }
        });
        document.dispatchEvent(event);
  },
  warning: (message) => {
      let event = new CustomEvent("toast_message", {
          detail: {
            type: "warning",
            message: message
          }
        });
        document.dispatchEvent(event);
  }
}
