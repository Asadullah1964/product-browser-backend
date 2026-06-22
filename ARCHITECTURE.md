# Pagination Design

Used cursor based pagination.

Products are sorted by:

created_at DESC
_id DESC


Cursor contains:

createdAt
_id


Why not skip/limit?

Offset pagination becomes slower for large offsets and can cause duplicates/missing records when data changes.


Index:

category + created_at + _id


This allows MongoDB to efficiently filter and continue scanning from cursor.