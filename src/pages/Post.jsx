import { useState } from 'react'

// Displays the form and manages Question and Article selection.
function Post() {
  // Stores the selected post type and the values entered by the user.
  const [postType, setPostType] = useState('question')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [abstract, setAbstract] = useState('')
  const [articleText, setArticleText] = useState('')
  const [tags, setTags] = useState('')

  // Checks the form before displaying a success or error popup.
  function handleSubmit(event) {
    event.preventDefault()

    // A title is required for both types of posts.
    if (!title.trim()) {
      alert('Please enter a title.')
      return
    }

    // A question must include a problem description.
    if (postType === 'question' && !description.trim()) {
      alert('Please describe your problem.')
      return
    }

    // An article must include an abstract and article text.
    if (postType === 'article' && !abstract.trim()) {
      alert('Please enter an abstract.')
      return
    }

    if (postType === 'article' && !articleText.trim()) {
      alert('Please enter the article text.')
      return
    }

    // Splits comma-separated tags and removes empty entries.
    const tagList = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)

    // Allows a maximum of three tags.
    if (tagList.length > 3) {
      alert('Please enter no more than three tags.')
      return
    }

    // Shows confirmation without saving the post to a backend.
    alert(`Your ${postType} has been sent successfully.`)
  }

  return (
    <main className="post-page">
      <h1 className="post-heading">New Post</h1>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="post-type-fieldset">
          <legend>Select Post Type:</legend>

          {/* Radio buttons let the user choose which form to display. */}
          <label className="post-type-option">
            <input
              type="radio"
              name="postType"
              checked={postType === 'question'}
              onChange={() => setPostType('question')}
            />
            Question
          </label>

          <label className="post-type-option">
            <input
              type="radio"
              name="postType"
              checked={postType === 'article'}
              onChange={() => setPostType('article')}
            />
            Article
          </label>
        </fieldset>

        <section className="post-section">
          <h2>What do you want to ask or share</h2>

          <p className="post-description">
            This section changes based on your selection.
          </p>

          {/* The title field is shared by both post types. */}
          <label className="post-field-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="post-input"
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder={
              postType === 'question'
                ? 'Start your question with how, what, why, etc.'
                : 'Enter a descriptive title'
            }
          />

          {/* Conditional rendering displays fields for the selected type. */}
          {postType === 'question' ? (
            <>
              <label className="post-field-label" htmlFor="description">
                Describe your problem
              </label>
              <textarea
                id="description"
                className="post-textarea question-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
              />
            </>
          ) : (
            <>
              <label className="post-field-label" htmlFor="abstract">
                Abstract
              </label>
              <textarea
                id="abstract"
                className="post-textarea article-abstract"
                value={abstract}
                onChange={event => setAbstract(event.target.value)}
                placeholder="Enter a 1-paragraph abstract"
              />

              <label className="post-field-label" htmlFor="articleText">
                Article Text
              </label>
              <textarea
                id="articleText"
                className="post-textarea article-text"
                value={articleText}
                onChange={event => setArticleText(event.target.value)}
                placeholder="Enter the article text"
              />
            </>
          )}

          {/* Both post types use the same tags field. */}
          <label className="post-field-label" htmlFor="tags">
            Tags
          </label>
          <input
            id="tags"
            className="post-input"
            value={tags}
            onChange={event => setTags(event.target.value)}
            placeholder="Add up to 3 tags separated by commas, e.g., Java"
          />

          <div className="post-submit-row">
            <button type="submit" className="post-submit">
              Post
            </button>
          </div>
        </section>
      </form>
    </main>
  )
}

export default Post