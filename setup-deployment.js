#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function runCommand(cmd, cwd = process.cwd()) {
  try {
    console.log(`\n$ ${cmd}`);
    const output = execSync(cmd, { cwd, stdio: 'inherit', encoding: 'utf-8' });
    return output;
  } catch (error) {
    throw new Error(`Command failed: ${cmd}`);
  }
}

async function main() {
  try {
    const projectDir = process.cwd();
    
    console.log('\n🚀 AgriFaaS Connect - Deployment Setup\n');
    
    // Get credentials
    const githubUsername = await prompt('GitHub username: ');
    const githubToken = await prompt('GitHub personal access token: ');
    const repoName = await prompt('Repository name (default: agrifaas-connect): ') || 'agrifaas-connect';
    
    // Step 1: Initialize git
    console.log('\n📦 Step 1: Initializing git repository...');
    if (!fs.existsSync(path.join(projectDir, '.git'))) {
      runCommand('git init', projectDir);
      runCommand('git config user.email "deploy@agrifaas.com"', projectDir);
      runCommand('git config user.name "AgriFaaS Deploy"', projectDir);
      runCommand('git add .', projectDir);
      runCommand('git commit -m "Initial commit: Farm Management Suite"', projectDir);
    } else {
      console.log('✅ Git repository already initialized');
    }
    
    // Step 2: Create GitHub repo via CLI
    console.log('\n📝 Step 2: Creating GitHub repository...');
    try {
      runCommand(`gh repo create ${repoName} --public --source=. --remote=origin --push`, projectDir);
      console.log(`✅ Repository created: https://github.com/${githubUsername}/${repoName}`);
    } catch (error) {
      console.log('⚠️  GitHub CLI not available. Using manual setup...');
      console.log(`\n📍 Create repo manually at: https://github.com/new`);
      console.log(`   Then run: git remote add origin https://github.com/${githubUsername}/${repoName}.git`);
      console.log(`   Then run: git push -u origin main`);
    }
    
    // Step 3: Create vercel.json
    console.log('\n⚙️  Step 3: Creating Vercel configuration...');
    const vercelConfig = {
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      env: {
        GEMINI_API_KEY: '@gemini_api_key'
      }
    };
    fs.writeFileSync(path.join(projectDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
    console.log('✅ vercel.json created');
    
    // Step 4: Create .env.example
    console.log('\n📋 Step 4: Creating environment template...');
    const envExample = `GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
`;
    fs.writeFileSync(path.join(projectDir, '.env.example'), envExample);
    console.log('✅ .env.example created');
    
    // Step 5: Update .gitignore
    console.log('\n🔒 Step 5: Updating .gitignore...');
    let gitignore = fs.readFileSync(path.join(projectDir, '.gitignore'), 'utf-8');
    const additions = '\n# Environment variables\n.env\n.env.local\n.env.*.local\n\n# Vercel\n.vercel\n';
    if (!gitignore.includes('.env')) {
      fs.appendFileSync(path.join(projectDir, '.gitignore'), additions);
      console.log('✅ .gitignore updated');
    }
    
    // Step 6: Vercel deployment instructions
    console.log('\n🚀 Step 6: Vercel Deployment Setup\n');
    console.log('To deploy to Vercel:');
    console.log('1. Go to https://vercel.com/new');
    console.log('2. Import your GitHub repository');
    console.log('3. Set environment variables:');
    console.log('   - GEMINI_API_KEY: Your Gemini API key');
    console.log('4. Click Deploy');
    console.log('\nOr use Vercel CLI:');
    console.log('   npm i -g vercel');
    console.log('   vercel');
    
    console.log('\n✨ Setup complete!\n');
    console.log('📍 Next steps:');
    console.log(`   1. Push to GitHub: git push -u origin main`);
    console.log(`   2. Deploy to Vercel: https://vercel.com/new`);
    console.log(`   3. Add environment variables in Vercel dashboard`);
    
    rl.close();
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
