import { chromium, Browser, Page } from 'playwright';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import process from 'process';

interface DeployConfig {
  githubUsername: string;
  githubToken: string;
  repoName: string;
  geminiApiKey: string;
  projectDir: string;
}

class DeploymentAutomation {
  private browser: Browser | null = null;
  private config: DeployConfig;

  constructor(config: DeployConfig) {
    this.config = config;
  }

  private async runCommand(cmd: string): Promise<string> {
    try {
      console.log(`\n$ ${cmd}`);
      return execSync(cmd, { 
        cwd: this.config.projectDir, 
        encoding: 'utf-8',
        stdio: 'inherit'
      });
    } catch (error: any) {
      throw new Error(`Command failed: ${cmd}\n${error.message}`);
    }
  }

  async setupGit(): Promise<void> {
    console.log('\n📦 Setting up Git repository...');
    
    try {
      this.runCommand('git status');
      console.log('✅ Git repository already initialized');
    } catch {
      this.runCommand('git init');
      this.runCommand('git config user.email "deploy@agrifaas.com"');
      this.runCommand('git config user.name "AgriFaaS Deploy"');
    }

    this.runCommand('git add .');
    this.runCommand('git commit -m "Initial commit: AgriFaaS Connect Farm Management Suite" || true');
  }

  async createGitHubRepo(page: Page): Promise<string> {
    console.log('\n📝 Creating GitHub repository via Playwright...');
    
    await page.goto('https://github.com/new', { waitUntil: 'networkidle' });
    
    // Check if logged in
    const loginLink = await page.$('a[href="/login"]');
    if (loginLink) {
      console.log('🔐 Logging into GitHub...');
      await page.click('a[href="/login"]');
      await page.waitForNavigation();
      
      await page.fill('input#login_field', this.config.githubUsername);
      await page.fill('input#password', this.config.githubToken);
      await page.click('input[type="submit"]');
      await page.waitForNavigation();
      await page.goto('https://github.com/new', { waitUntil: 'networkidle' });
    }

    // Fill repository form
    await page.fill('input#repository_name', this.config.repoName);
    await page.fill('textarea#repository_description', 'Farm Management Suite with AI-powered insights and Firebase integration');
    
    // Make public
    const publicRadio = await page.$('input[value="public"]');
    if (publicRadio) {
      await publicRadio.click();
    }

    // Create repository
    await page.click('button:has-text("Create repository")');
    await page.waitForNavigation();

    const repoUrl = page.url();
    console.log(`✅ Repository created: ${repoUrl}`);
    
    return repoUrl;
  }

  async pushToGitHub(repoUrl: string): Promise<void> {
    console.log('\n📤 Pushing code to GitHub...');
    
    const httpsUrl = repoUrl.replace(/\/$/, '.git');
    const gitUrl = httpsUrl.replace('https://github.com/', `https://${this.config.githubUsername}:${this.config.githubToken}@github.com/`);
    
    try {
      this.runCommand(`git remote remove origin || true`);
      this.runCommand(`git remote add origin ${gitUrl}`);
      this.runCommand('git branch -M main');
      this.runCommand('git push -u origin main');
      console.log('✅ Code pushed to GitHub');
    } catch (error) {
      console.error('⚠️  Push failed:', error);
      throw error;
    }
  }

  async setupVercelDeployment(page: Page): Promise<void> {
    console.log('\n🚀 Setting up Vercel deployment...');
    
    await page.goto('https://vercel.com/new', { waitUntil: 'networkidle' });

    // Check if logged in
    const loginLink = await page.$('a:has-text("Log in")');
    if (loginLink) {
      console.log('🔐 Logging into Vercel...');
      await page.click('a:has-text("Log in")');
      await page.waitForNavigation();
    }

    // Import from GitHub
    const githubButton = await page.$('button:has-text("Continue with GitHub")');
    if (githubButton) {
      await githubButton.click();
      await page.waitForNavigation();
    }

    // Search and select repository
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.fill(this.config.repoName);
      await page.waitForTimeout(1000);
      
      const importBtn = await page.$('button:has-text("Import")');
      if (importBtn) {
        await importBtn.click();
        await page.waitForNavigation();
      }
    }

    // Configure project
    const projectNameInput = await page.$('input[name="projectName"]');
    if (projectNameInput) {
      await projectNameInput.fill('agrifaas-connect');
    }

    // Add environment variables
    const envButton = await page.$('button:has-text("Environment Variables")');
    if (envButton) {
      await envButton.click();
      await page.waitForTimeout(500);

      // Add GEMINI_API_KEY
      const keyInputs = await page.$$('input[placeholder="Key"]');
      const valueInputs = await page.$$('input[placeholder="Value"]');
      
      if (keyInputs.length > 0 && valueInputs.length > 0) {
        await keyInputs[0].fill('GEMINI_API_KEY');
        await valueInputs[0].fill(this.config.geminiApiKey);
      }
    }

    // Deploy
    const deployBtn = await page.$('button:has-text("Deploy")');
    if (deployBtn) {
      await deployBtn.click();
      await page.waitForNavigation();
      console.log('✅ Vercel deployment initiated');
    }
  }

  async run(): Promise<void> {
    try {
      this.browser = await chromium.launch({ headless: false });
      
      // Step 1: Setup Git
      await this.setupGit();

      // Step 2: Create GitHub repo
      const page1 = await this.browser.newPage();
      const repoUrl = await this.createGitHubRepo(page1);
      await page1.close();

      // Step 3: Push to GitHub
      await this.pushToGitHub(repoUrl);

      // Step 4: Setup Vercel
      const page2 = await this.browser.newPage();
      await this.setupVercelDeployment(page2);
      await page2.close();

      console.log('\n✨ Deployment setup complete!');
      console.log(`📍 GitHub: ${repoUrl}`);
      console.log('🚀 Vercel: Check your Vercel dashboard for deployment status');
      console.log('📚 Documentation: See DEPLOYMENT.md for more details');

    } catch (error) {
      console.error('\n❌ Deployment setup failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Main execution
async function main() {
  const config: DeployConfig = {
    githubUsername: process.env.GITHUB_USERNAME || '',
    githubToken: process.env.GITHUB_TOKEN || '',
    repoName: process.env.REPO_NAME || 'agrifaas-connect',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    projectDir: process.cwd(),
  };

  if (!config.githubUsername || !config.githubToken || !config.geminiApiKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   GITHUB_USERNAME, GITHUB_TOKEN, GEMINI_API_KEY');
    process.exit(1);
  }

  const automation = new DeploymentAutomation(config);
  await automation.run();
}

main().catch(console.error);