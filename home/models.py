from django.db import models

class Connection(models.Model):
    created = models.BooleanField(default=False)
    offer = models.TextField(blank=True)
    answer = models.TextField(blank=True)