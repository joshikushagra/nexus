import dotenv from "dotenv";
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const githubFetch = async (url) => {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `GitHub API error: ${res.status}`);
  }
  return res.json();
};

// @desc   Get org metadata
// @route  GET /api/github/org/:orgName
export const getOrgInfo = async (req, res, next) => {
  try {
    const data = await githubFetch(
      `https://api.github.com/orgs/${req.params.orgName}`
    );
    res.json({
      success: true,
      data: {
        login: data.login,
        name: data.name,
        description: data.description,
        avatarUrl: data.avatar_url,
        publicRepos: data.public_repos,
        htmlUrl: data.html_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   List org repos (sorted by updated_at)
// @route  GET /api/github/org/:orgName/repos
export const getOrgRepos = async (req, res, next) => {
  try {
    const data = await githubFetch(
      `https://api.github.com/orgs/${req.params.orgName}/repos?sort=updated&per_page=30`
    );
    const repos = data.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      htmlUrl: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
      private: r.private,
    }));
    res.json({ success: true, count: repos.length, data: repos });
  } catch (error) {
    next(error);
  }
};

// @desc   List public org members
// @route  GET /api/github/org/:orgName/members
export const getOrgMembers = async (req, res, next) => {
  try {
    const data = await githubFetch(
      `https://api.github.com/orgs/${req.params.orgName}/members?per_page=30`
    );
    const members = data.map((m) => ({
      id: m.id,
      login: m.login,
      avatarUrl: m.avatar_url,
      htmlUrl: m.html_url,
    }));
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    next(error);
  }
};
