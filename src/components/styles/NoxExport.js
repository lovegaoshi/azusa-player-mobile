import SteriaTheme from "./SteriaTheme.js";
import fs from "fs";

fs.writeFile("./NoxExport.json", JSON.stringify(SteriaTheme), () => undefined);
