// !!! 🛑  DO NOT EDIT THIS FILE BY HAND
// THIS FILE IS GENERATED BY packages/modules-tools/prepareModules.ts

import AuthModule from "./Auth";
import CoreDataModule from "./CoreData";
import OBSModule from "./OBS";
import SampleCalculatorModule from "./SampleCalculator";
import SystemFilesModule from "./SystemFiles";
import SystemShellModule from "./SystemShell";

export const AllModules = {
  Auth: AuthModule,
  CoreData: CoreDataModule,
  OBS: OBSModule,
  SampleCalculator: SampleCalculatorModule,
  SystemFiles: SystemFilesModule,
  SystemShell: SystemShellModule,
};
    
export const Auth = AuthModule;
export const CoreData = CoreDataModule;
export const OBS = OBSModule;
export const SampleCalculator = SampleCalculatorModule;
export const SystemFiles = SystemFilesModule;
export const SystemShell = SystemShellModule;
    
// Module Specs:
// {"Auth":{},"CoreData":{},"OBS":{"actions":"./OBS.actions","npmDependencies":{"obs-websocket-js":"^4.0.3"}},"SampleCalculator":{"actions":"./SampleCalculator.actions","state":"./SampleCalculator.state"},"SystemFiles":{"npmDependencies":{"fs-extra":"*"}},"SystemShell":{}}

// END AUTO-GENERATED BY packages/modules-tools/prepareModules.ts