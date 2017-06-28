from google.appengine.ext import ndb

class Actions(ndb.Model):
    """Front-end actions."""
    date = ndb.DateTimeProperty(auto_now_add=True)
    start_time = ndb.StringProperty()  # Client start time (should be ISO 8601 format, but not enforced).
    duration = ndb.IntegerProperty()  # Action duration (milliseconds)
    action = ndb.JsonProperty(compressed=True)
    prev_state = ndb.JsonProperty(compressed=True)
    next_state = ndb.JsonProperty(compressed=True)
    error = ndb.StringProperty()
    experiment_id = ndb.StringProperty()
    participant_id = ndb.StringProperty()
    participant_index = ndb.IntegerProperty()
    task_id = ndb.StringProperty()
