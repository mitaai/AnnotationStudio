function byDocumentPermissionsFilterMatch(
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

function byPermissionsIdeaSpaceFilterMatch(annoPermissions, filterPermissions) {
  if (!filterPermissions.private && !filterPermissions.shared) {
    return true;
  }

  if (filterPermissions.private) {
    return annoPermissions.private;
  }

  return !annoPermissions.private;
}

function byGroupFilterMatch(annoGroups, filterGroups) { // OR FUNCTION
  if (filterGroups.length === 0) {
    return true;
  }

  if (annoGroups === undefined) {
    return false;
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

function byTagFilterMatch(annosTags, filterTags) { // OR FUNCTION
  if (filterTags.length === 0) {
    return true;
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

export {
  byDocumentPermissionsFilterMatch,
  byPermissionsIdeaSpaceFilterMatch,
  annotatedByFilterMatch,
  byTagFilterMatch,
  byGroupFilterMatch,
  byDocumentFilterMatch,
};
