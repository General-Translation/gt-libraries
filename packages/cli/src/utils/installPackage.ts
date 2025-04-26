import chalk from 'chalk';
import { spawn } from 'child_process';
import { logError, logInfo } from '../console';
import { PackageManager } from './packageManager';

export async function installPackage(
  packageName: string,
  packageManager: PackageManager,
  asDevDependency?: boolean
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const command = packageManager.name;
    const args = [packageManager.installCommand, packageName];

    if (asDevDependency) {
      args.push(packageManager.devDependencyFlag);
    }

    const childProcess = spawn(command, args, {
      stdio: ['pipe', 'ignore', 'pipe'],
    });

    let errorOutput = '';
    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
    }

    childProcess.on('error', (error) => {
      logError(chalk.red(`Installation error: ${error.message}`));
      logInfo(
        `Please manually install ${packageName} with: ${packageManager.name} ${packageManager.installCommand} ${packageName}`
      );
      reject(error);
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        logError(chalk.red(`Installation failed with exit code ${code}`));
        if (errorOutput) {
          logError(chalk.red(`Error details: ${errorOutput}`));
        }
        logInfo(
          `Please manually install ${packageName} with: ${packageManager.name} ${packageManager.installCommand} ${packageName}`
        );
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}
