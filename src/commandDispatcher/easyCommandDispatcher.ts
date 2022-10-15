import * as vscode from 'vscode';
import { PackageInfo } from '../types';
import { IOptionsBuilder, IPackageRunner } from '../packageRunner/types';
import { BasicCommandDispatcher } from './basicCommandDispatcher';
import { PackageRunner } from 'src/packageRunner/packageRunner';
import { PythonVSCodeTerminal } from 'src/pythonTerminal/pythonVSCodeTerminal';
import { PythonHiddenTerminal } from 'src/pythonTerminal/pythonHiddenTerminal';

export class EasyCommandDispatcher extends BasicCommandDispatcher {
  private optionsBuilder: IOptionsBuilder;
  constructor(
    context: vscode.ExtensionContext,
    packageInfo: PackageInfo,
    optionsBuilder: IOptionsBuilder
  ) {
    super(
      context,
      packageInfo,
      EasyCommandDispatcher.createPackageRunner(packageInfo, optionsBuilder)
    );
    this.optionsBuilder = optionsBuilder;
  }

  public activate(): void {
    const disposable = vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('autoflake-extension.extension')) {
        this.packageRunner = EasyCommandDispatcher.createPackageRunner(
          this.packageInfo,
          this.optionsBuilder
        );
      }
    });

    this.context.subscriptions.push(disposable);
    super.activate();
  }

  private static createPackageRunner(
    packageInfo: PackageInfo,
    optionsBuilder: IOptionsBuilder
  ): IPackageRunner {
    const useIntegrated = vscode.workspace
      .getConfiguration(
        packageInfo.useIntegratedTerminalConfigurationSectionFullName
          .split('.')
          .slice(0, -1)
          .join('.')
      )
      .get<boolean>(
        packageInfo.useIntegratedTerminalConfigurationSectionFullName.split(
          '.'
        )[-1],
        false
      );

    console.log(`useIntegratedTerminal changed to ${useIntegrated.toString()}`);

    return new PackageRunner(
      useIntegrated
        ? new PythonVSCodeTerminal()
        : new PythonHiddenTerminal(undefined),
      optionsBuilder,
      packageInfo,
      () => Promise.resolve(new PythonVSCodeTerminal())
    );
  }
}
