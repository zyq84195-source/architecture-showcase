const url = 'https://architecture-showcase.vercel.app/auth/login';
fetch(url).then(r => r.text()).then(c => {
  // Find body content
  const bodyStart = c.indexOf('<body');
  const bodyEnd = c.indexOf('</body>');
  if (bodyStart > 0 && bodyEnd > 0) {
    const body = c.substring(bodyStart, bodyEnd + 7);
    console.log('Body length:', body.length);
    
    // Check for error indicators
    const lowerBody = body.toLowerCase();
    if (lowerBody.includes('internal server error') || lowerBody.includes('application error')) {
      console.log('FOUND APP ERROR');
      // Extract error details
      const errorMatch = body.match(/error[^<]{0,500}/gi);
      if (errorMatch) errorMatch.forEach(m => console.log('ERR:', m.substring(0, 200)));
    }
    
    // Check if there's actual UI content
    const hasForm = body.includes('email') || body.includes('password') || body.includes('登录');
    console.log('Has form fields:', hasForm);
    
    // Print first 1000 chars of body
    console.log('BODY PREVIEW:', body.substring(0, 1000));
  }
}).catch(e => console.log('Fetch error:', e.message));
