
interface Story {
    title: string;
    summary_bullets: string[];
    content: string;
}

export function getWelcomeEmailHtml(unsubscribeUrl: string) {
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to Bedtime Stories! 🌙</h1>
        <p style="color: #374151; font-size: 16px;">
            You've successfully subscribed. Get ready for magical tales delivered straight to your inbox everyday.
        </p>
        <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">✨ What to expect:</h3>
            <ul style="color: #4B5563;">
                <li>Unique, AI-generated stories appropriate for children.</li>
                <li>Adventures, fables, and calming bedtime tales.</li>
                <li>A perfect way to start or end the day!</li>
            </ul>
        </div>
        <p style="font-size: 12px; color: #6B7280; text-align: center; margin-top: 40px;">
            If you wish to stop receiving stories, you can <a href="${unsubscribeUrl}" style="color: #6B7280;">unsubscribe here</a>.
        </p>
    </div>
  `;
}

export function getStoryEmailHtml(story: Story, unsubscribeUrl: string) {
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">${story.title}</h1>
      
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">📚 Story Summary:</h3>
        <ul>
          ${story.summary_bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
        </ul>
      </div>
      
      <div style="line-height: 1.8; color: #374151;">
        ${story.content}
      </div>
      
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #E5E7EB;">
      
      <p style="font-size: 12px; color: #6B7280; text-align: center;">
        <a href="${unsubscribeUrl}" style="color: #6B7280;">Unsubscribe</a>
      </p>
    </div>
  `;
}

export function getAdminReviewEmailHtml(storyTitle: string, reviewUrl: string, dateStr: string, isDraft: boolean = false) {
    const header = isDraft
        ? `<h2>Review Pending for ${dateStr}</h2>`
        : `<h2>New Story Generated for ${dateStr}</h2>`;

    const subtext = isDraft
        ? `<p>This story was already generated but hasn't been approved yet.</p>`
        : ``;

    return `
    ${header}
    <h3>${storyTitle}</h3>
    ${subtext}
    <p>Click the link below to review and approve:</p>
    <a href="${reviewUrl}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Review Story</a>
  `;
}
