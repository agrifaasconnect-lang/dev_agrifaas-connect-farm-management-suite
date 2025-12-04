#!/usr/bin/env node

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class Deployer {
  constructor() {
    this.projectDir = process.cwd();
    this.githubUsername = process.env.GITHUB_USERNAME;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.repoName = process.env.REPO_NAME || 'agrifaas-connect';
    this.geminiKey = process.env.GEMINI_API_KEY;
  }

  log(msg) {
    console.log(`\n${msg}`);
  }

  exec(cmd) {
    try {
      console.log(`$ ${cmd}`);
      return execSync(cmd, { 
        cwd: this.projectDir, 
        stdio: 'inherit',
        encoding: 'utf-8'
      });
    } catch (e) {
      throw new Error(`Failed: ${cmd}`);
    }
  }

  async setupGit() {
    this.log('📦 Setting up Git...');
    try {
      this.exec('git status');
      this.log('✅ Git already initialized');
    } catch {
      this.exec('git init');
      this.exec('git config user.email "deploy@agrifaas.com"');
      this.exec('git config user.name "AgriFaaS Deploy"');
    }
    this.exec('git add .');
    this.exec('git commit -m "Initial commit: AgriFaaS Connect" || true');
  }

  async createGitHubRepo(page) {
    this.log('📝 Creating GitHub repository...');
    
    await page.goto('https://github.com/new', { waitUntil: 'networkidle' });
    
    const loginLink = await page.$('a[href="/login"]');
    if (loginLink) {
      this.log('🔐 Logging into GitHub...');
      await page.click('a[href="/login"]');
      await page.waitForNavigation();
      await page.fill('input#login_field', this.githubUsername);
      await page.fill('input#password', this.githubToken);
      await page.click('input[type="submit"]');
      await page.waitForNavigation();
      await page.goto('https://github.com/new', { waitUntil: 'networkidle' });
    }

    await page.fill('input#repository_name', this.repoName);
    await page.fill('textarea#repository_description', 'Farm Management Suite with AI insights');
    
    const publicRadio = await page.$('input[value="public"]');
    if (publicRadio) await publicRadio.click();

    await page.click('button:has-text("Create repository")');
    await page.waitForNavigation();

    const url = page.url();
    this.log(`✅ Repository created: ${url}`);
    return url;
  }

  async pushToGitHub(repoUrl) {
    this.log('📤 Pushing to GitHub...');
    
    const httpsUrl = repoUrl.replace(/\/$/, '.git');
    const gitUrl = httpsUrl.replace(
      'https://github.com/',
      `https://${this.githubUsername}:${this.githubToken}@github.com/`
    );

    this.exec('git remote remove origin || true');
    this.exec(`git remote add origin ${gitUrl}`);
    this.exec('git branch -M main');
    this.exec('git push -u origin main');
    this.log('✅ Code pushed');
  }

  async setupVercel(page) {
    this.log('🚀 Setting up Vercel...');
    
    await page.goto('https://vercel.com/new', { waitUntil: 'networkidle' });

    const loginLink = await page.$('a:has-text("Log in")');
    if (loginLink) {
      this.log('🔐 Logging into Vercel...');
      await page.click('a:has-text("Log in")');
      await page.waitForNavigation();
    }

    const githubBtn = await page.$('button:has-text("Continue with GitHub")');
    if (githubBtn) {
      await githubBtn.click();
      await page.waitForNavigation();
    }

    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.fill(this.repoName);
      await page.waitForTimeout(1000);
      const importBtn = await page.$('button:has-text("Import")');
      if (importBtn) {
        await importBtn.click();
        await page.waitForNavigation();
      }
    }

    const projectInput = await page.$('input[name="projectName"]');
    if (projectInput) {
      await projectInput.fill('agrifaas-connect');
    }

    const envBtn = await page.$('button:has-text("Environment Variables")');
    if (envBtn) {
      await envBtn.click();
      await page.waitForTimeout(500);
      const keyInputs = await page.$$('input[placeholder="Key"]');
      const valInputs = await page.$$('input[placeholder="Value"]');
      if (keyInputs.length > 0 && valInputs.length > 0) {
        await keyInputs[0].fill('GEMINI_API_KEY');
        await valInputs[0].fill(this.geminiKey);
      }
    }

    const deployBtn = await page.$('button:has-text("Deploy")');
    if (deployBtn) {
      await deployBtn.click();
      await page.waitForNavigation();
      this.log('✅ Vercel deployment initiated');
    }
  }

  async run() {
    try {
      if (!this.githubUsername || !this.githubToken || !this.geminiKey) {
        throw new Error('Missing: GITHUB_USERNAME, GITHUB_TOKEN, or GEMINI_API_KEY');
      }

      const browser = await chromium.launch({ headless: false });

      await this.setupGit();

      const page1 = await browser.newPage();
      const repoUrl = await this.createGitHubRepo(page1);
      await page1.close();

      await this.pushToGitHub(repoUrl);

      const page2 = await browser.newPage();
      await this.setupVercel(page2);
      await page2.close();

      await browser.close();

      this.log('\n✨ Setup complete!');
      this.log(`📍 GitHub: ${repoUrl}`);
      this.log('🚀 Vercel: Check dashboard for deployment');

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  }
}

new Deployer().run();
