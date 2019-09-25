var fs = require('fs');

const DOCS_CONTENT_PATH = "../docs/content/framework";

// List all files in a directory in Node.js recursively in a synchronous fashion
const walkSync = (dir, filePathList = []) => {
    let files = fs.readdirSync(dir);
    files.forEach(function(file) {
      if (fs.statSync(dir + '/' + file).isDirectory()) {
        filePathList = walkSync(dir + '/' + file, filePathList);
      }
      else {
        filePathList.push(dir + '/' + file);
      }
    });
    return filePathList;
};

const replaceTypeScriptCodeTicksClosestToSwitch = fileContentParts => {
    const find = "```typescript";
    const stop = '@@switch';
    const replacement = "<!-- tabs:start -->\n#### ** Typescript **\n```typescript";

    let doesInstanceExist = false;
    let maxIndex = 0;
    // Start from beginning, find closest ```typescript to @@switch
    for (let i = 0; i < fileContentParts.length; i++) {
        if (fileContentParts[i] === find) {
            doesInstanceExist = true;
            maxIndex = i;
        };

        if (fileContentParts[i] === stop) {
            break;
        }
    }

    if (doesInstanceExist) {
        fileContentParts[maxIndex] = replacement;
    }

    return fileContentParts;
}

const replaceLastCodeTicksClosestToSwitch = fileContentParts => {
    const find = "```";
    const replacement = "```\n<!-- tabs:end -->";
    const startSearchingString = '@@switch';

    let isStartSearching = false;

    // Find closest ``` to @@switch
    for (let i = 0; i < fileContentParts.length; i++) {
        if (fileContentParts[i] === find && isStartSearching === true) {
            fileContentParts[i] = replacement;
            return fileContentParts;
        };

        if (fileContentParts[i] === startSearchingString) {
            isStartSearching = true;
        }
    }
}

const replaceSwitch = fileContentParts => {
    const find = '@@switch';
    const replacement = "```\n#### ** Javascript **\n```javascript";
    for (let i = 0; i < fileContentParts.length; i++) {
        if (fileContentParts[i] === find) {
            fileContentParts[i] = replacement;
            return fileContentParts;
        };
    }
}


// Get all file paths from docs directory
let filePathList = walkSync(DOCS_CONTENT_PATH, []);

// Loop through all files
filePathList.forEach(filePath => {
    // Get contents of file
    fs.readFile(filePath, { encoding: 'utf8' }, (error, contents) => {
        if (contents.includes('@@switch')) {
            contents = contents.split("\n");
            while (contents.includes('@@switch')) {
                contents = replaceTypeScriptCodeTicksClosestToSwitch(contents);
                contents = replaceLastCodeTicksClosestToSwitch(contents);
                contents = replaceSwitch(contents);
            }

            contents = contents.join("\n");

            console.info(`Writing to file ${filePath}`);
            fs.writeFileSync(filePath, contents);
        }
    });
})

