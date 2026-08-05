import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

const dir = process.cwd();

async function run() {
  console.log('Initializing Git repository via Node.js isomorphic-git...');
  try {
    await git.init({ fs, dir });
    console.log('Git repository initialized.');

    // Set remote
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://github.com/DarshiniLokesh/Smart-Task-Manager.git',
      force: true,
    });
    console.log('Remote origin set to https://github.com/DarshiniLokesh/Smart-Task-Manager.git');

    // Read files ignoring node_modules, .next, .env.local, .git
    const ignoreList = ['node_modules', '.next', '.git', '.env.local', '.DS_Store'];

    function getAllFiles(currentDir, relativePath = '') {
      let results = [];
      const list = fs.readdirSync(currentDir);
      list.forEach((file) => {
        if (ignoreList.includes(file)) return;
        const fullPath = path.join(currentDir, file);
        const relPath = relativePath ? `${relativePath}/${file}` : file;
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getAllFiles(fullPath, relPath));
        } else {
          results.push(relPath);
        }
      });
      return results;
    }

    const filesToStage = getAllFiles(dir);
    console.log(`Staging ${filesToStage.length} project files...`);

    for (const filepath of filesToStage) {
      await git.add({ fs, dir, filepath });
    }

    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: 'Darshini Lokesh',
        email: 'darshinilokesh@users.noreply.github.com',
      },
      message: 'Build full-stack Smart Task Manager with Next.js App Router, MongoDB, dnd-kit & AI',
    });

    console.log('Committed successfully with SHA:', sha);
    console.log('Project is fully committed locally!');
  } catch (err) {
    console.error('Git operation error:', err);
  }
}

run();
