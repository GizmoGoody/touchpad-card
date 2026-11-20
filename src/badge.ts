/**
 * GizmoGoody console badge, shared by every GizmoGoody card.
 * Prints a collapsed console group: [icon + name][version] by GizmoGoody,
 * with the description and links inside. Colors are the original Touchpad Card
 * navy (#001689) and silver (#9ea1a2). Copy this file unchanged into other cards.
 */
export interface BadgeInfo {
  icon: string;
  name: string;
  version: string;
  description: string;
  repo: string; // GitHub repository name under GizmoGoody, for example "touchpad-card"
}

const NAVY = "#001689";
const SILVER = "#9ea1a2";
const BASE = "font-family: DejaVu Sans, Verdana, Geneva, sans-serif; padding: 2px 6px; text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);";

export function printBadge(info: BadgeInfo): void {
  const url = `https://github.com/GizmoGoody/${info.repo}`;
  console.groupCollapsed(
    `%c${info.icon} ${info.name}%cv${info.version}%c by GizmoGoody`,
    `${BASE} background-color: ${NAVY}; color: ${SILVER}; border-radius: 999px 0 0 999px; padding-left: 10px;`,
    `${BASE} background-color: ${SILVER}; color: ${NAVY}; border-radius: 0 999px 999px 0; padding-right: 10px; font-weight: bold;`,
    "font-style: italic; color: inherit;"
  );
  console.log(`%cDescription:%c ${info.description}`, "font-weight: bold;", "font-weight: normal;");
  console.log(`%cGitHub:%c ${url}`, "font-weight: bold;", "font-weight: normal;");
  console.log(`%cReport an issue:%c ${url}/issues`, "font-weight: bold;", "font-weight: normal;");
  console.groupEnd();
}
