const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

async function runSetup() {
    const scripts = [
        'create-db.js',
        'setup-users-db.js',
        'setup-flashcards-db.js', // Added this
        'setup-shadowing-db.js',
        'setup-dictation-db.js',
        'setup-reverse-translation-db.js',
        'setup-vocab-review-cycles-db.js',
        'setup-vocab-mistakes-db.js'
    ];

    console.log('Iniciando setup do banco de dados...\n');

    for (const script of scripts) {
        console.log(`--- Executando ${script} ---`);
        try {
            const scriptPath = path.join(__dirname, script);
            const { stdout, stderr } = await execPromise(`node "${scriptPath}"`);
            console.log(stdout);
            if (stderr) console.error(stderr);
        } catch (error) {
            console.log(`Erro ao executar ${script}:`);
            console.error(error.message);
            if (script === 'create-db.js' || script === 'setup-users-db.js') {
                console.error('Falha crítica no setup inicial. Abortando.');
                process.exit(1);
            }
        }
    }

    console.log('\nSetup concluído!');
}

runSetup();
