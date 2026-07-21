import React from "react";

const securityEnabled = process.env.SECURITY_ENABLED === "true";

export const DisableRightClickScript: React.FC = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
      document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
      });
    `,
    }}
  />
);

export const DisableF12Script: React.FC = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
      document.addEventListener("keydown", function(e) {
        if (e.key === "F12" || e.keyCode === 123) {
          e.preventDefault();
        }
      });
    `,
    }}
  />
);

export const DisableCtrlShiftIScript: React.FC = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
      document.addEventListener("keydown", function(e) {
        if (
          (e.ctrlKey || e.metaKey) &&
          (e.shiftKey || e.altKey) &&
          e.key.toLowerCase() === "i"
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      });
    `,
    }}
  />
);

export const DisableDeveloperToolsScript: React.FC = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
      document.addEventListener("DOMContentLoaded", function() {
        const menu = document.querySelector(".more-tools-menu");
        if (menu) {
          const items = menu.querySelectorAll(".menu-item");
          items.forEach(item => {
            if (item.textContent.trim() === "Developer Tools") {
              item.addEventListener("click", function(event) {
                event.stopPropagation();
                event.preventDefault();
                return false;
              });
            }
          });
        }
      });
    `,
    }}
  />
);

export const CustomSecurity: React.FC = () =>
  securityEnabled ? (
    <>
      <DisableRightClickScript />
      <DisableF12Script />
      <DisableCtrlShiftIScript />
      <DisableDeveloperToolsScript />
    </>
  ) : (
    <></>
  );
