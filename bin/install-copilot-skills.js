#!/usr/bin/env node
import { createInstallerFromFile, runAsMain } from './_utils.js';

export const install = createInstallerFromFile(import.meta.url);
export { install as installCopilotSkills };

runAsMain(install, import.meta.url);
