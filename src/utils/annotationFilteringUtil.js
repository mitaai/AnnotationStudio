import moment from 'moment';

function byPermissionsDocumentViewFilterMatch(
  userEmail, email, permissions, cf, userId,
) { // AND FUNCTION
  if (cf.permissions === 0 && userEmail === email) { // mine
    return true;
  }

  if (cf.permissions === 1 && !permissions.private && !permissions.sharedTo) { // shared
    return true;
  }

  if (cf.permissions === 2 && permissions.sharedTo !== undefined) { // shared with specific people
    return permissions.sharedTo.includes(userId);
  }

  return false;
}

function byPermissionsIdeaSpaceFilterMatch({
  user: {
    email: userEmail,
    id: userId,
  },
  annotation: { permissions, creator: { email } },
  filterPermissions,
}) {
  if (filterPermissions.mine) {
    return userEmail === email;
  }

  if (filterPermissions.sharedWithMe) {
    return permissions.sharedTo ? permissions.sharedTo.includes(userId) : false;
  }

  if (filterPermissions.private) {
    return permissions.private;
  }

  if (filterPermissions.shared) {
    return !permissions.private && !permissions.sharedTo;
  }

  return true;
}

function byGroupFilterMatch(annoGroups, filterGroups) { // OR FUNCTION
  if (filterGroups.length === 0) {
    return true;
  }

  if (annoGroups === undefined) {
    return filterGroups.includes('privateGroup');
  }

  if (annoGroups.length === 0 && filterGroups.includes('privateGroup')) {
    return true;
  }

  for (let i = 0; i < annoGroups.length; i += 1) {
    if (filterGroups.includes(annoGroups[i])) {
      return true;
    }
  }
  return false;
}

function annotatedByFilterMatch(email, annotatedByFilter) { // AND FUNCTION
  return annotatedByFilter.length === 0 ? true : annotatedByFilter.includes(email);
}

const NO_TAG_KEY = '<{[no tag]}>';

function byTagFilterMatch(annosTags, filterTags) { // OR FUNCTION
  if (filterTags.length === 0) {
    return true;
  }

  if (filterTags.some((t) => t === NO_TAG_KEY)) {
    if (filterTags.length > 1) {
      return false;
    }
    
    if (annosTags?.length === 0) {
      return true;
    }
  }

  if (annosTags === undefined) {
    return false;
  }

  for (let i = 0; i < annosTags.length; i += 1) {
    if (filterTags.includes(annosTags[i])) {
      return true;
    }
  }
  return false;
}

function byDocumentFilterMatch(did, filterDids) {
  return filterDids.length === 0 || filterDids.includes(did);
}

function byDateCreatedFilterMatch(annoDateCreated, byDateCreated) {
  // if start, end, or checked equal undefined we will just return true otherwise we will check if
  // the annotation date created is actually inside the date range
  if (!byDateCreated || !byDateCreated.checked || !byDateCreated.start || !byDateCreated.end) {
    return true;
  }
  return moment(annoDateCreated).isSameOrAfter(byDateCreated.start.toString())
    && moment(annoDateCreated).isSameOrBefore(byDateCreated.end.toString());
}

export {
  byPermissionsDocumentViewFilterMatch,
  byPermissionsIdeaSpaceFilterMatch,
  annotatedByFilterMatch,
  byTagFilterMatch,
  byGroupFilterMatch,
  byDocumentFilterMatch,
  byDateCreatedFilterMatch,
  NO_TAG_KEY,
};
