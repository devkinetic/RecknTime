(async function() {
  try {
    const FromDate = '2025-09-15';
    const ToDate = '2025-09-21';
    const UserEmail = 'foobar@test.com';

    const jql = encodeURIComponent(`worklogDate >= ${FromDate} AND worklogDate <= ${ToDate} AND worklogAuthor = currentUser()`);
    const baseUrl = window.location.origin;
    const searchUrl = `${baseUrl}/rest/api/2/search?jql=${jql}&fields=key,summary&maxResults=200`;

    const headers = {
      'Accept': 'application/json',
      'X-Atlassian-Token': 'no-check'
    };

    const searchResponse = await fetch(searchUrl, { headers, credentials: 'include' });
    if (!searchResponse.ok) throw new Error(`Search failed: ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    const allWorklogs = {};

    for (const issue of searchData.issues) {
      const key = issue.key;
      const summary = issue.fields.summary;
      const worklogUrl = `${baseUrl}/rest/api/2/issue/${key}/worklog`;

      const worklogResponse = await fetch(worklogUrl, { headers, credentials: 'include' });
      if (!worklogResponse.ok) throw new Error(`Worklog fetch failed for ${key}: ${worklogResponse.statusText}`);
      const worklogData = await worklogResponse.json();

      const filteredWorklogs = worklogData.worklogs.filter(wl => {
        const started = new Date(wl.started);
        const email = wl.author.emailAddress.toLowerCase();
        return email === UserEmail.toLowerCase() && started >= new Date(FromDate) && started <= new Date(ToDate);
      });

      allWorklogs[key] = { summary, worklogs: filteredWorklogs };
    }

    console.log('worklogs:', allWorklogs);
  } catch (err) {
    alert('Error: ' + err.message);
  }
})();