exports.get_groups_events = `{
  self {
    id
    name
    memberships {
      pageInfo {
        endCursor
      }
      edges {
        node {
          id
          name
          urlname
          isOrganizer
          unifiedUpcomingEvents {
            count
            pageInfo {
              endCursor
            }
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    }
  }
}`;

exports.get_event = `
        query ($eventId: ID) {
  event(id: $eventId) {
    title
    description
    dateTime
    duration
  }
}`;


exports.create_event_draft = `
      mutation($input: CreateEventDraftInput!) {
  createEventDraft(input: $input) {
    event {
      id
    }
    errors {
      message
      code
      field
    }
  }
}`;


exports.publish_event = `
    mutation($input: PublishEventDraftInput!) {
  publishEventDraft(input: $input) {
    event {
      id
    }
    errors {
      message
      code
      field
    }
  }
}`;

exports.edit_event = `
        mutation($input: EditEventInput!) {
  editEvent(input: $input) {
    event {
      id
    }
    errors {
      message
      code
      field
    }
  }
}`


exports.delete_event = `
    mutation($input: DeleteEventInput!) {
  deleteEvent(input: $input) {
    errors {
      message
      code
      field
    }
  }
}`;
