import generate_code from "./code_generator.js";
import fs from "fs";
import simpleGit from "simple-git";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// Replace these values with your repository details
const REPO_PATH = "/Users/mohsiniqbal/projects/github-push-script";
const GITHUB_USERNAME = "mohsin013";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Directly include the token
const GITHUB_REPO = "Daily_code_push";

const git = simpleGit(REPO_PATH);

async function initializeRepo() {
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      console.log("Initialized new Git repository.");
    }
  } catch (err) {
    console.error("Error initializing repository:", err);
    process.exit(1); // Exit the script with a failure code
  }
}

// Function to set up or update the remote
async function setupRemote() {
  try {
    const remotes = await git.getRemotes(true);
    const originRemote = remotes.find((remote) => remote.name === "origin");
    const remoteUrl = `https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git`;

    if (originRemote) {
      await git.remote(["set-url", "origin", remoteUrl]);
      console.log("Updated remote URL.");
    } else {
      await git.addRemote("origin", remoteUrl);
      console.log("Added remote URL.");
    }
  } catch (err) {
    console.error("Error setting up remote:", err);
    process.exit(1); // Exit the script with a failure code
  }
}

// Function to pull the latest changes from the remote repository
async function pullChanges() {
  try {
    await git.pull("origin", "main", { "--rebase": "true" });
    console.log("Pulled latest changes from remote repository.");
  } catch (err) {
    console.error("Error pulling from remote repository:", err);
    process.exit(1); // Exit the script with a failure code
  }
}

// Function to create a new file with random code
async function createFile() {
  try {
    const content = await generate_code();
    const parsedContent = JSON.parse(content);
    console.log("parsedContent", parsedContent);
    const fileName = parsedContent.fileName;
    console.log(parsedContent.fileName, parsedContent.codeSnippet);
    const filePath = path.join(REPO_PATH, fileName);
    fs.writeFileSync(filePath, parsedContent.codeSnippet);
    return { fileName, filePath };
  } catch (err) {
    console.error("Error creating file:", err);
    process.exit(1); // Exit the script with a failure code
  }
}

// Function to commit and push the file to GitHub
async function commitAndPush(fileName) {
  try {
    await git.add(fileName);
    await git.commit(`Add ${fileName}`);
    await git.push("origin", "main");
    console.log(`Successfully pushed ${fileName} to GitHub.`);
  } catch (err) {
    console.error("Error pushing to GitHub:", err);
    process.exit(1); // Exit the script with a failure code
  }
}

function deleteLocalFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log("Deleted local file:", filePath);
  } catch (err) {
    console.error("Error deleting local file:", err);
    process.exit(1); // Exit the script with a failure code
  }
}

// Main function
(async function main() {
  await initializeRepo(); // Initialize the repo if not already initialized
  await setupRemote(); // Set up the remote
  await pullChanges(); // Pull latest changes from remote
  const { fileName, filePath } = await createFile(); // Create the file and get the filename
  await commitAndPush(fileName); // Commit and push the file
  deleteLocalFile(filePath); // Delete the local file
})();
