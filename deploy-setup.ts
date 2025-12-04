import { chromium } from 'playwright';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import process from 'process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runCommand(cmd: string, cwd: string = process.cwd()): Promise<string> {
  try {
    const output = execSync(cmd, { cwd, encoding: 'utf-8' });
    return output;
  } catch (error: any) {
    throw new Error(`Command failed: ${cmd}\n${error.message}`);
  }
}

async function setupGitHub(browser: any, repoName: string, githubUsername: string, githubPassword: string): Promise<string> {
  console.log('\n📝 Setting up GitHub repository...');
  
  const page = await browser.newPage();
  await page.goto('https://github.com/new');
  
  // Wait for login if needed
  const loginButton = await page.$('a[href="/login"]');
  if (loginButton) {
    console.log('🔐 Logging into GitHub...');
    await page.click('a[href="/login"]');
    await page.fill('input#login_field', githubUsername);
    await page.fill('input#password', githubPassword);
    await page.click('input[type="submit"]');
    await page.waitForNavigation();
    await page.goto('https://github.com/new');
  }
  
  // Fill repository details
  await page.fill('input#repository_name', repoName);
  await page.fill('textarea#repository_description', 'Farm Management Suite with AI-powered insights');
  
  // Make it public
  await page.click('input#repository_public');
  
  // Add .gitignore
  await page.click('select#gitignore_template');
  await page.selectOption('select#gitignore_template', 'Node');
  
  // Create repository
  await page.click('button:has-text("Create repository")');
  await page.waitForNavigation();
  
  const repoUrl = page.url();
  console.log(`✅ GitHub repository created: ${repoUrl}`);
  
  await page.close();
  return repoUrl;
}

async function setupVercel(browser: any, githubRepoUrl: string): Promise<void> {
  console.log('\n🚀 Setting up Vercel deployment...');
  
  const page = await browser.newPage();
  await page.goto('https://vercel.com/new');
  
  // Wait for login if needed
  const loginButton = await page.$('a:has-text("Log in")');
  if (loginButton) {
    console.log('🔐 Logging into Vercel...');
    await page.click('a:has-text("Log in")');
    await page.waitForNavigation();
  }
  
  // Import GitHub repository
  await page.click('button:has-text("Continue with GitHub")');
  await page.waitForNavigation();
  
  // Search for repository
  await page.fill('input[placeholder*="Search"]', githubRepoUrl.split('/').pop());
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Import")');
  await page.waitForNavigation();
  
  // Configure project
  await page.fill('input[name="projectName"]', 'agrifaas-connect');
  
  // Set environment variables
  await page.click('button:has-text("Environment Variables")');
  await page.fill('input[placeholder="Key"]', 'GEMINI_API_KEY');
  await page.fill('input[placeholder="Value"]', process.env.GEMINI_API_KEY || '');
  
  // Deploy
  await page.click('button:has-text("Deploy")');
  await page.waitForNavigation();
  
  console.log('✅ Vercel deployment configured');
  await page.close();
}

async function main() {
  try {
    const projectDir = process.cwd();
    
    // Get credentials
    const githubUsername = await prompt('GitHub username: ');
    const githubPassword = await prompt('GitHub password (or token): ');
    const repoName = await prompt('Repository name (default: agrifaas-connect): ') || 'agrifaas-connect';
    
    // Initialize git if not already done
    if (!fs.existsSync(path.join(projectDir, '.git'))) {
      console.log('\n📦 Initializing git repository...');
      await runCommand('git init', projectDir);
      await runCommand('git add .', projectDir);
      await runCommand(`git commit -m "Initial commit: Farm Management Suite"`, projectDir);
    }
    
    // Launch browser
    const browser = await chromium.launch({ headless: false });
    
    // Setup GitHub
    const repoUrl = await setupGitHub(browser, repoName, githubUsername, githubPassword);
    
    // Add remote and push
    console.log('\n📤 Pushing to GitHub...');
    const remoteUrl = repoUrl.replace('https://github.com/', 'git@github.com:').replace(/\/$/, '.git');
    await runCommand(`git remote add origin ${remoteUrl}`, projectDir);
    await runCommand('git branch -M main', projectDir);
    await runCommand('git push -u origin main', projectDir);
    console.log('✅ Code pushed to GitHub');
    
    // Setup Vercel
    await setupVercel(browser, repoUrl);
    
    await browser.close();
    rl.close();
    
    console.log('\n✨ Setup complete! Your app is ready for deployment.');
    console.log(`📍 GitHub: ${repoUrl}`);
    console.log('🚀 Vercel: Check your Vercel dashboard for deployment status');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    rl.close();
    process.exit(1);
  }
}

main();