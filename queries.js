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

exports.create_event_draft = (count) => {
  return {
    current_variable: `$input${count}: CreateEventDraftInput!`,
    current_query: `query${count}: createEventDraft(input: $input${count}) {
    event {
      id
    }
    errors {
      message
      code
      field
    }
  }`,
  };
};

exports.publish_event = (count) => {
  return {
    current_variable: `$input${count}: PublishEventDraftInput!`,
    current_query: `query${count}: publishEventDraft(input: $input${count}) {
    event {
      id
    }
    errors {
      message
      code
      field
    }
  }`,
  };
};

exports.edit_event = (count) => {
  return {
    current_variable: `$input${count}: EditEventInput!`,

    current_query: `query${count}: editEvent(input: $input${count}) {
    event {
      id
    }
    errors {
      message
      code
      field
    }
  }`,
  };
};

exports.delete_event = (count) => {
  return {
    current_variable: `$input${count}: DeleteEventInput!`,
    current_query: `query${count}: deleteEvent(input: $input${count}) {
    errors {
      message
      code
      field
    }
  }`,
  };
};
